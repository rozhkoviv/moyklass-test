const sequelize = require("../db");
const Sequelize = require('sequelize');

module.exports.LessonsService = class LessonsService {

    paramValidator(param, type) {
        if (param === undefined)
            return;
        switch(type) {
            case 'status':
                if (param !== '0' && param !== '1' )
                    throw new Error(`'status' has wrong format. must be 1 or 0`);
                break;
            case 'date':
                let dates = param.split(',');
                if (dates.length <= 2) {
                    dates.forEach(dateEntry => {
                        const isValid = /\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])/.test(dateEntry);
                        if (!isValid)
                            throw new Error(`'date' has wrong format. must be 'YYYY-MM-DD' or 'YYYY-MM-DD,YYYY-MM-DD'`);
                    })
                    return;
                }
                throw new Error(`'date' has wrong format. must be 'YYYY-MM-DD' or 'YYYY-MM-DD,YYYY-MM-DD'`);
            case 'teachers':
                let teacherIds = param.split(',');
                teacherIds.forEach(teacherId => {
                    if (isNaN(teacherId))
                        throw new Error(`'teacherIds' has wrong format. must be ID (number)`);
                })
                break;
            case 'students':
                let students = param.split(',');
                if (students.length <= 2) {
                    students.forEach(studentsCount => {
                        if(isNaN(studentsCount))
                            throw new Error(`'studentsCount' has wrong format. must be (number) or (number from),(number to)`);
                    })
                } else
                    throw new Error(`'studentsCount' has wrong format. must be (number) or (number from),(number to)`);
                break;
            case 'page':
                if (isNaN(param) || param < 1)
                    throw new Error(`'page' has wrong format. must be (number) > 1`);
                break;
            case 'lessons':
                if (isNaN(param) || param < 0)
                    throw new Error(`'lessonsPerPage' has wrong format. must be (number) > 0`);
                break;
        }
    }

    async getAllWithFilter({ date, status, teacherIds, studentsCount, page = 1, lessonsPerPage = 5 }) {

        this.paramValidator(date, "date");
        this.paramValidator(status, "status");
        this.paramValidator(teacherIds, "teachers");
        this.paramValidator(studentsCount, "students");
        this.paramValidator(page, "page");
        this.paramValidator(lessonsPerPage, "lessons");

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
            if(count.length === 2) {
                students_count_clause = sequelize.where(sequelize.literal('(SELECT COUNT("student_id") FROM "lesson_students" WHERE "lesson_id" = "lessons"."id")'), {
                    [Sequelize.Op.between]: count
                })
            } else {
                students_count_clause = sequelize.where(sequelize.literal('(SELECT COUNT("student_id") FROM "lesson_students" WHERE "lesson_id" = "lessons"."id")'), {
                    [Sequelize.Op.eq]: count[0]
                })
            }
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
}