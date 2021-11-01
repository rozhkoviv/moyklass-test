module.exports.ValidatorTypes = ValidatorTypes = {
    posNumberArray: 1,
    date: 2,
    dateArray: 3,
    bool: 4,
    number: 5,
    rangeDates: 6,
    rangeNumbers: 7,
    string: 8,
    dayOfWeekArray: 9
}

module.exports.ValidatorService = class ValidatorService {

    validateDate(param) {
        return /\d{4}-(0[1-9]|1[0-2])-(0[1-9]|[12][0-9]|3[01])/.test(param);
    }

    validateNumber(param) {
        return (!isNaN(param));
    }

    validateBoolean(param) {
        return (param === '1' || param === '0' || param === 1 || param === 0);
    }

    validateString(param) {
        return( typeof param === 'string' || param instanceof String );
    }

    validateDayOfWeek(param) {
        return (this.validateNumber(param))?(param >= 0 && param <= 6):false;
    }

    validateDayOfWeekArray(param) {
        if (!Array.isArray(param)) return false;

        let isGood = true;
        param.forEach(val => {
            if (!this.validateDayOfWeek(val))
                isGood = false;
        })
        return isGood;
    }

    validateNumberArray(param) {
        if (!Array.isArray(param)) return false;

        let isGood = true;
        param.forEach(val => {
            if (!this.validateNumber(val))
                isGood = false;
        })
        return isGood;
    }

    validatePositiveNumberArray(param) {
        if (!Array.isArray(param)) return false;

        let isGood = true;
        param.forEach(val => {
            if (!this.validatePositiveNumber(val))
                isGood = false;
        })
        return isGood;
    }

    validatePositiveNumber(param) {
        return (!isNaN(param) && param > 0);
    }

    validateDateArray(param) {
        if (!Array.isArray(param)) return false;

        let isGood = true;
        param.forEach(val => {
            if (!this.validateDate(val))
                isGood = false;
        })
        return isGood;
    }

    validateRange(param, name, type) {
        if (!Array.isArray(param)) return false;

        switch (type) {
            case ValidatorTypes.rangeDates:
                if (param.length > 2 || param.length === 0) return false;
                return (param.length === 1)?this.validateDate(param[0]):this.validateDateArray(param);
                break;
            case ValidatorTypes.rangeNumbers:
                if (param.length > 2 || param.length === 0) return false;
                return (param.length === 1)?this.validatePositiveNumber(param[0]):this.validatePositiveNumberArray(param);
                break;
            default:
                throw new Error(`undefined param '${name}' type ${type}`);
                break;
        }
    }

    validate(param, name, type, isRequired = false) {
        if(param === undefined) {
            if (isRequired)
                throw new Error(`${name} must be specified`);
            else
                return;
        }
        switch(type) {
            case ValidatorTypes.posNumberArray: 
                if(!this.validatePositiveNumberArray((Array.isArray(param))?param:param.split(',')))
                    throw new Error(`${name} must be array of numbers`);
                break;
            case ValidatorTypes.date:
                if(!this.validateDate(param))
                    throw new Error(`${name} must be date 'YYYY-MM-DD'`);
                break;
            case ValidatorTypes.dateArray:
                if(!this.validateDateArray((Array.isArray(param))?param:param.split(',')))
                    throw new Error(`${name} must be array of dates 'YYYY-MM-DD'`);
                break;
            case ValidatorTypes.string:
                if(!this.validateString(param))
                    throw new Error(`${name} must be string`);
                break;
            case ValidatorTypes.bool:
                if(!this.validateBoolean(param))
                    throw new Error(`${name} must be 1 or 0`);
                break;
            case ValidatorTypes.number:
                if(!this.validatePositiveNumber(param))
                    throw new Error(`${name} must be number > 0`);
                break;
            case ValidatorTypes.rangeDates:
                if(!this.validateRange((Array.isArray(param))?param:param.split(','), name, type))
                    throw new Error(`${name} must be ('YYYY-MM-DD') or ('YYYY-MM-DD','YYYY-MM-DD')`);
                break;
            case ValidatorTypes.rangeNumbers:
                if(!this.validateRange((Array.isArray(param))?param:param.split(','), name, type))
                    throw new Error(`${name} must be (number) or (number, number)`);
                break;
            case ValidatorTypes.dayOfWeekArray:
                if(!this.validateDayOfWeekArray((Array.isArray(param))?param:param.split(','), name, type))
                    throw new Error(`${name} must be array (0 - 6)`);
                break;
            default:
                throw new Error(`undefined param '${name}' type ${type}`);
                break;
        }
    }

}