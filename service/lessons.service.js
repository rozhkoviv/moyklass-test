const { sequelize } = require("../db");
const Sequelize = require('sequelize');
const log4js = require('log4js');
const { ValidatorService, ValidatorTypes } = require("./validator.service");

const Logger = log4js.getLogger("LessonsService");
Logger.level = (process.env.DEBUG)?"debug":"info";

module.exports.LessonsService = class LessonsService {

    constructor() {
        this.validatorService = new ValidatorService();
    }
   
    maxLessonsCountOnCreate = 300;
    maxDaysRangeOnCreate = 360;

    async getAllWithFilter({ date, status, teacherIds, studentsCount, page = 1, lessonsPerPage = 5 }) {

        this.validatorService.validate(date, "date", ValidatorTypes.rangeDates);
        this.validatorService.validate(status, "status", ValidatorTypes.bool);
        this.validatorService.validate(teacherIds, "teacherIds", ValidatorTypes.posNumberArray);
        this.validatorService.validate(studentsCount, "studentsCount", ValidatorTypes.rangeNumbers);
        this.validatorService.validate(page, "page", ValidatorTypes.number);
        this.validatorService.validate(lessonsPerPage, "lessonsPerPage", ValidatorTypes.number);

        const {lessons, students, teachers} = sequelize.models;

        let date_clause = {};

        if(date !== undefined) {
            const dates = date.split(',');
            if(dates.length === 2) {
                date_clause.date = {
                    [Sequelize.Op.between]: dates.map(date => new Date(date))
                }
            } else {
                date_clause.date = new Date(dates[0]);
            }
        }

        let students_count_clause = {};

        if(studentsCount !== undefined) {
            const count = studentsCount.split(',');
            students_count_clause = sequelize.where(sequelize.literal('(SELECT COUNT("student_id") FROM "lesson_students" WHERE "lesson_id" = "lessons"."id")'),
                (count.length === 2) ? {
                    [Sequelize.Op.between]: count
                }: {
                    [Sequelize.Op.eq]: count[0]
                }
            )
        }

        const teachers_where_clause = (teacherIds !== undefined)?
        sequelize.literal(`(select "lesson_teachers"."lesson_id" from "lesson_teachers" as "lesson_teachers" inner join "teachers" as "teacher" on "lesson_teachers"."teacher_id" = "teacher"."id" and "teacher"."id" in (${teacherIds}) where ("lessons"."id" = "lesson_teachers"."lesson_id") limit 1 ) is not null`):{};

        const where_clause = Sequelize.and(
            students_count_clause,
            date_clause,
            teachers_where_clause
        );

        let lessons_table = await lessons.findAll({
            attributes: {
                include: [
                    [sequelize.literal('(SELECT COUNT("visit") FROM "lesson_students" WHERE "lesson_id" = "lessons"."id" AND "visit" = true)'), 'visitCount']
                ]
            },
            where: where_clause,
            include: [
                {
                    model: students
                },
                {
                    model: teachers
                }
            ],
            offset: lessonsPerPage * (page - 1),
            limit: lessonsPerPage
        });

        return lessons_table.map(lesson => {
            return {
                id: lesson.id,
                studentsCount: lesson.studentsCount,
                date: lesson.date,
                title: lesson.title,
                status: lesson.status,
                visitCount: lesson.dataValues.visitCount,
                students: lesson.students.map(student => { return { id: student.id, name: student.name, visit: student.lesson_students.visit }}),
                teachers: lesson.teachers.map(teacher => { return { id: teacher.id, name: teacher.name }})
            }
        });
    }

    async createLessons({ teacherIds, title, days, firstDate, lessonsCount, lastDate }) {
        
        const useLessonsCount = (lessonsCount !== undefined);

        this.validatorService.validate(teacherIds, 'teacherIds', ValidatorTypes.posNumberArray, true);
        this.validatorService.validate(title, 'title', ValidatorTypes.string, true);
        this.validatorService.validate(days, 'days', ValidatorTypes.dayOfWeekArray, true);
        this.validatorService.validate(firstDate, 'firstDate', ValidatorTypes.date, true)
        this.validatorService.validate(lessonsCount, 'lessonsCount', ValidatorTypes.number, useLessonsCount);
        this.validatorService.validate(lastDate, 'lastDate', ValidatorTypes.date, !useLessonsCount)

        const { lessons, teachers } = sequelize.models;

        const transaction = await sequelize.transaction();

        let newLessons = [];
        
        try {
            const lessonTeachers = await teachers.findAll( { where: { id : { [Sequelize.Op.in]: teacherIds }}, transaction });

            if (useLessonsCount) {
                let createdLessonsCount = 0;
                for (let date = new Date(firstDate); (createdLessonsCount < this.maxLessonsCountOnCreate && createdLessonsCount < lessonsCount); date.setDate(date.getDate() + 1))
                {
                    if (days.includes(date.getDay())) {
                        createdLessonsCount++;
                        newLessons.push(lessons.create({
                            title,
                            date
                        }, { transaction }))
                    }
                }
            } else {
                const lastDateVal = new Date(lastDate);
                let maxDate = new Date(firstDate);
                maxDate.setDate(maxDate.getDate() + this.maxDaysRangeOnCreate);
                for (let date = new Date(firstDate); (date < maxDate && date < lastDateVal); date.setDate(date.getDate() + 1)) {
                    if (days.includes(date.getDay())) {
                        newLessons.push(lessons.create({
                            title,
                            date
                        }, { transaction }))
                    }
                }
            }

            newLessons = await Promise.all(newLessons);

            await Promise.all(newLessons.map(lesson => lesson.setTeachers(lessonTeachers, { transaction })));

            await transaction.submit();

            return await Promise.all(newLessons).then(lessons => lessons.map(lesson => lesson.id));

        } catch (ex) {
            await transaction.rollback();
            Logger.error(ex);
            throw ex;
        }
    }
};