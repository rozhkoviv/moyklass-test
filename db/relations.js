module.exports = (sequelize) => {
    const { teachers, students, lessons, lesson_teachers, lesson_students } = sequelize.models;

    lessons.belongsToMany(students, { through: lesson_students, foreignKey: 'lesson_id' });
    students.belongsToMany(lessons, { through: lesson_students, foreignKey: 'student_id'});
    lessons.belongsToMany(teachers, { through: lesson_teachers, foreignKey: 'lesson_id' });
    teachers.belongsToMany(lessons, { through: lesson_teachers, foreignKey: 'teacher_id'});
}