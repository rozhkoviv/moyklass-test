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
                }
                throw new Error(`'studentsCount' has wrong format. must be (number) or (number from),(number to)`);
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

        const where_clause = {
            
        }

        if(date !== undefined) {
            const dates = date.split(',');
            if(dates.length === 2) {
                where_clause.date = {
                    [Sequelize.Op.between]: dates
                }
            } else {
                where_clause.date = dates[0];
            }
        }

        const teachers_where_clause = (teacherIds !== undefined)?{
            id: {
                [Sequelize.Op.in]: teacherIds.split(',')
            }
        }:{};

        let lessons_table = await lessons.findAll({
            attributes: Object.keys(lessons.rawAttributes).concat([
                [sequelize.literal('(SELECT COUNT("visit") FROM "lesson_students" WHERE "lesson_id" = "lessons"."id" AND "visit" = true)'), 'visitCount']
            ]),
            where: where_clause,
            include: [
                {
                    model: students
                },
                {
                    model: teachers,
                    where: teachers_where_clause
                }
            ],
            offset: lessonsPerPage * (page - 1),
            limit: lessonsPerPage
        });

        console.log(lessons_table[0].students)
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