import { options, createContext, Fragment, Component, createElement, toChildArray, render } from 'preact';
import { useContext, useEffect, useState } from 'preact/hooks';
import { signal, effect } from '@preact/signals';

var f=0;function u(e,t,n,o,i,u){var a,c,p={};for(c in t)"ref"==c?a=t[c]:p[c]=t[c];var l={type:e,props:p,key:n,ref:a,__k:null,__:null,__b:0,__e:null,__d:void 0,__c:null,constructor:void 0,__v:--f,__i:-1,__u:0,__source:i,__self:u};if("function"==typeof e&&(a=e.defaultProps))for(c in a)void 0===p[c]&&(p[c]=a[c]);return options.vnode&&options.vnode(l),l}

const AppContext$1 = createContext({});

const DateFormats = {
    DATE_STRING: /^\d{4}-\d{2}-\d{2}$/,
    TIME_STRING: /^\d{2}:\d{2}$/,
    DATE_TIME_STRING: /^\d{4}-\d{2}-\d{2} \d{2}:\d{2}$/,
};

class InvalidDateTimeError extends Error {
    constructor(dateTimeSpecification) {
        super(`Invalid date time specification: ${dateTimeSpecification}`);
    }
}

const toJSDate = (dateTimeSpecification) => {
    if (!DateFormats.DATE_TIME_STRING.test(dateTimeSpecification) &&
        !DateFormats.DATE_STRING.test(dateTimeSpecification))
        throw new InvalidDateTimeError(dateTimeSpecification);
    return new Date(Number(dateTimeSpecification.slice(0, 4)), Number(dateTimeSpecification.slice(5, 7)) - 1, Number(dateTimeSpecification.slice(8, 10)), Number(dateTimeSpecification.slice(11, 13)), // for date strings this will be 0
    Number(dateTimeSpecification.slice(14, 16)) // for date strings this will be 0
    );
};
const toIntegers = (dateTimeSpecification) => {
    const hours = dateTimeSpecification.slice(11, 13), minutes = dateTimeSpecification.slice(14, 16);
    return {
        year: Number(dateTimeSpecification.slice(0, 4)),
        month: Number(dateTimeSpecification.slice(5, 7)) - 1,
        date: Number(dateTimeSpecification.slice(8, 10)),
        hours: hours !== '' ? Number(hours) : undefined,
        minutes: minutes !== '' ? Number(minutes) : undefined,
    };
};

const toLocalizedMonth = (date, locale) => {
    return date.toLocaleString(locale, { month: 'long' });
};
const toLocalizedDateString = (date, locale) => {
    return date.toLocaleString(locale, {
        month: 'numeric',
        day: 'numeric',
        year: 'numeric',
    });
};
const getOneLetterDayNames = (week, locale) => {
    return week.map((date) => {
        return date.toLocaleString(locale, { weekday: 'short' }).charAt(0);
    });
};
const getDayNameShort = (date, locale) => date.toLocaleString(locale, { weekday: 'short' });
const getDayNamesShort = (week, locale) => {
    return week.map((date) => getDayNameShort(date, locale));
};
const getOneLetterOrShortDayNames = (week, locale) => {
    if (['zh-cn'].includes(locale.toLowerCase())) {
        return getDayNamesShort(week, locale);
    }
    return getOneLetterDayNames(week, locale);
};

var img = "data:image/svg+xml,%3c%3fxml version='1.0' encoding='utf-8'%3f%3e%3c!-- Uploaded to: SVG Repo%2c www.svgrepo.com%2c Generator: SVG Repo Mixer Tools --%3e%3csvg width='800px' height='800px' viewBox='0 0 24 24' fill='none' xmlns='http://www.w3.org/2000/svg'%3e%3cpath d='M6 9L12 15L18 9' stroke='%23DED8E1' stroke-width='4' stroke-linecap='round' stroke-linejoin='round'/%3e%3c/svg%3e";

/**
 * Can be used for generating a random id for an entity
 * Should, however, never be used in potentially resource intense loops,
 * since the performance cost of this compared to new Date().getTime() is ca x4 in v8
 * */
const randomStringId = () => 's' + Math.random().toString(36).substring(2, 11);

const isKeyEnterOrSpace = (keyboardEvent) => keyboardEvent.key === 'Enter' || keyboardEvent.key === ' ';

function AppInput() {
    const datePickerInputId = randomStringId();
    const datePickerLabelId = randomStringId();
    const inputWrapperId = randomStringId();
    const $app = useContext(AppContext$1);
    const getLocalizedDate = (dateString) => {
        if (dateString === '')
            return $app.translate('MM/DD/YYYY');
        return toLocalizedDateString(toJSDate(dateString), $app.config.locale);
    };
    useEffect(() => {
        $app.datePickerState.inputDisplayedValue.value = getLocalizedDate($app.datePickerState.selectedDate.value);
    }, [$app.datePickerState.selectedDate.value]);
    const [wrapperClasses, setWrapperClasses] = useState([]);
    const setInputElement = () => {
        const inputWrapperEl = document.getElementById(inputWrapperId);
        $app.datePickerState.inputWrapperElement.value =
            inputWrapperEl instanceof HTMLDivElement ? inputWrapperEl : undefined;
    };
    useEffect(() => {
        if ($app.config.teleportTo)
            setInputElement();
        const newClasses = ['sx__date-input-wrapper'];
        if ($app.datePickerState.isOpen.value)
            newClasses.push('sx__date-input--active');
        setWrapperClasses(newClasses);
    }, [$app.datePickerState.isOpen.value]);
    const handleKeyUp = (event) => {
        if (event.key === 'Enter')
            handleInputValue(event);
    };
    const handleInputValue = (event) => {
        event.stopPropagation(); // prevent date picker from closing
        try {
            $app.datePickerState.inputDisplayedValue.value = event.target.value;
            $app.datePickerState.close();
        }
        catch (e) {
            // nothing to do
        }
    };
    useEffect(() => {
        const inputElement = document.getElementById(datePickerInputId);
        if (inputElement === null)
            return;
        inputElement.addEventListener('change', handleInputValue); // Preact onChange triggers on every input
        return () => inputElement.removeEventListener('change', handleInputValue);
    });
    const handleClick = (event) => {
        handleInputValue(event);
        $app.datePickerState.open();
    };
    const handleButtonKeyDown = (keyboardEvent) => {
        if (isKeyEnterOrSpace(keyboardEvent)) {
            keyboardEvent.preventDefault();
            $app.datePickerState.open();
            setTimeout(() => {
                const element = document.querySelector('[data-focus="true"]');
                if (element instanceof HTMLElement)
                    element.focus();
            }, 50);
        }
    };
    return (u(Fragment, { children: u("div", { className: wrapperClasses.join(' '), id: inputWrapperId, children: [u("label", { for: datePickerInputId, id: datePickerLabelId, className: "sx__date-input-label", children: $app.config.label || $app.translate('Date') }), u("input", { id: datePickerInputId, "aria-describedby": datePickerLabelId, value: $app.datePickerState.inputDisplayedValue.value, "data-testid": "date-picker-input", className: "sx__date-input", onClick: handleClick, onKeyUp: handleKeyUp, type: "text" }), u("button", { "aria-label": $app.translate('Choose Date'), onKeyDown: handleButtonKeyDown, className: "sx__date-input-chevron-wrapper", children: u("img", { className: "sx__date-input-chevron", src: img, alt: "" }) })] }) }));
}

var DatePickerView;
(function (DatePickerView) {
    DatePickerView["MONTH_DAYS"] = "month-days";
    DatePickerView["YEARS"] = "years";
})(DatePickerView || (DatePickerView = {}));

const YEARS_VIEW = 'years-view';
const MONTH_VIEW = 'months-view';
const DATE_PICKER_WEEK = 'date-picker-week';

class NumberRangeError extends Error {
    constructor(min, max) {
        super(`Number must be between ${min} and ${max}.`);
        Object.defineProperty(this, "min", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: min
        });
        Object.defineProperty(this, "max", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: max
        });
    }
}

const doubleDigit = (number) => {
    if (number < 0 || number > 99)
        throw new NumberRangeError(0, 99);
    return String(number).padStart(2, '0');
};

const toDateString$1 = (date) => {
    return `${date.getFullYear()}-${doubleDigit(date.getMonth() + 1)}-${doubleDigit(date.getDate())}`;
};
const toTimeString = (date) => {
    return `${doubleDigit(date.getHours())}:${doubleDigit(date.getMinutes())}`;
};
const toDateTimeString = (date) => {
    return `${toDateString$1(date)} ${toTimeString(date)}`;
};

const addMonths = (to, nMonths) => {
    const { year, month, date, hours, minutes } = toIntegers(to);
    const isDateTimeString = hours !== undefined && minutes !== undefined;
    const jsDate = new Date(year, month, date, hours !== null && hours !== void 0 ? hours : 0, minutes !== null && minutes !== void 0 ? minutes : 0);
    jsDate.setMonth(jsDate.getMonth() + nMonths);
    if (isDateTimeString) {
        return toDateTimeString(jsDate);
    }
    return toDateString$1(jsDate);
};
const addDays = (to, nDays) => {
    const { year, month, date, hours, minutes } = toIntegers(to);
    const isDateTimeString = hours !== undefined && minutes !== undefined;
    const jsDate = new Date(year, month, date, hours !== null && hours !== void 0 ? hours : 0, minutes !== null && minutes !== void 0 ? minutes : 0);
    jsDate.setDate(jsDate.getDate() + nDays);
    if (isDateTimeString) {
        return toDateTimeString(jsDate);
    }
    return toDateString$1(jsDate);
};

const dateFromDateTime = (dateTime) => {
    return dateTime.slice(0, 10);
};
const timeFromDateTime = (dateTime) => {
    return dateTime.slice(11);
};

const setDateOfMonth = (dateString, date) => {
    dateString = dateString.slice(0, 8) + doubleDigit(date) + dateString.slice(10);
    return dateString;
};
const getFirstDayOPreviousMonth = (dateString) => {
    dateString = addMonths(dateString, -1);
    return setDateOfMonth(dateString, 1);
};
const getFirstDayOfNextMonth = (dateString) => {
    dateString = addMonths(dateString, 1);
    return setDateOfMonth(dateString, 1);
};
const setTimeInDateTimeString = (dateTimeString, newTime) => {
    const dateCache = toDateString$1(toJSDate(dateTimeString));
    return `${dateCache} ${newTime}`;
};

function Chevron({ direction, onClick, buttonText, disabled = false, }) {
    const handleKeyDown = (keyboardEvent) => {
        if (isKeyEnterOrSpace(keyboardEvent))
            onClick();
    };
    return (u("button", { disabled: disabled, className: "sx__chevron-wrapper sx__ripple", onMouseUp: onClick, onKeyDown: handleKeyDown, tabIndex: 0, children: u("i", { className: `sx__chevron sx__chevron--${direction}`, children: buttonText }) }));
}

function MonthViewHeader({ setYearsView }) {
    const $app = useContext(AppContext$1);
    const dateStringToLocalizedMonthName = (selectedDate) => {
        const selectedDateJS = toJSDate(selectedDate);
        return toLocalizedMonth(selectedDateJS, $app.config.locale);
    };
    const getYearFrom = (datePickerDate) => {
        return toIntegers(datePickerDate).year;
    };
    const [selectedDateMonthName, setSelectedDateMonthName] = useState(dateStringToLocalizedMonthName($app.datePickerState.datePickerDate.value));
    const [datePickerYear, setDatePickerYear] = useState(getYearFrom($app.datePickerState.datePickerDate.value));
    const setPreviousMonth = () => {
        $app.datePickerState.datePickerDate.value = getFirstDayOPreviousMonth($app.datePickerState.datePickerDate.value);
    };
    const setNextMonth = () => {
        $app.datePickerState.datePickerDate.value = getFirstDayOfNextMonth($app.datePickerState.datePickerDate.value);
    };
    useEffect(() => {
        setSelectedDateMonthName(dateStringToLocalizedMonthName($app.datePickerState.datePickerDate.value));
        setDatePickerYear(getYearFrom($app.datePickerState.datePickerDate.value));
    }, [$app.datePickerState.datePickerDate.value]);
    const handleOpenYearsView = (e) => {
        e.stopPropagation();
        setYearsView();
    };
    return (u(Fragment, { children: u("header", { className: "sx__date-picker__month-view-header", children: [u(Chevron, { direction: 'previous', onClick: () => setPreviousMonth(), buttonText: $app.translate('Previous month') }), u("button", { className: "sx__date-picker__month-view-header__month-year", onClick: (event) => handleOpenYearsView(event), children: selectedDateMonthName + ' ' + datePickerYear }), u(Chevron, { direction: 'next', onClick: () => setNextMonth(), buttonText: $app.translate('Next month') })] }) }));
}

function DayNames() {
    const $app = useContext(AppContext$1);
    const aWeek = $app.timeUnitsImpl.getWeekFor(toJSDate($app.datePickerState.datePickerDate.value));
    const dayNames = getOneLetterOrShortDayNames(aWeek, $app.config.locale);
    return (u("div", { className: "sx__date-picker__day-names", children: dayNames.map((dayName) => (u("span", { "data-testid": "day-name", className: "sx__date-picker__day-name", children: dayName }))) }));
}

const isToday = (date) => {
    const today = new Date();
    return (date.getDate() === today.getDate() &&
        date.getMonth() === today.getMonth() &&
        date.getFullYear() === today.getFullYear());
};
const isSameMonth = (date1, date2) => {
    return (date1.getMonth() === date2.getMonth() &&
        date1.getFullYear() === date2.getFullYear());
};

/**
 * Origin of SVG: https://www.svgrepo.com/svg/506771/time
 * License: PD License
 * Author Salah Elimam
 * Author website: https://www.figma.com/@salahelimam
 * */
function TimeIcon({ strokeColor }) {
    return (u(Fragment, { children: u("svg", { className: "sx__event-icon", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [u("g", { id: "SVGRepo_bgCarrier", "stroke-width": "0" }), u("g", { id: "SVGRepo_tracerCarrier", "stroke-linecap": "round", "stroke-linejoin": "round" }), u("g", { id: "SVGRepo_iconCarrier", children: [u("path", { d: "M12 8V12L15 15", stroke: strokeColor, "stroke-width": "2", "stroke-linecap": "round" }), u("circle", { cx: "12", cy: "12", r: "9", stroke: strokeColor, "stroke-width": "2" })] })] }) }));
}

/**
 * Origin of SVG: https://www.svgrepo.com/svg/506772/user
 * License: PD License
 * Author Salah Elimam
 * Author website: https://www.figma.com/@salahelimam
 * */
function UserIcon({ strokeColor }) {
    return (u(Fragment, { children: u("svg", { className: "sx__event-icon", viewBox: "0 0 24 24", fill: "none", xmlns: "http://www.w3.org/2000/svg", children: [u("g", { id: "SVGRepo_bgCarrier", "stroke-width": "0" }), u("g", { id: "SVGRepo_tracerCarrier", "stroke-linecap": "round", "stroke-linejoin": "round" }), u("g", { id: "SVGRepo_iconCarrier", children: [u("path", { d: "M15 7C15 8.65685 13.6569 10 12 10C10.3431 10 9 8.65685 9 7C9 5.34315 10.3431 4 12 4C13.6569 4 15 5.34315 15 7Z", stroke: strokeColor, "stroke-width": "2" }), u("path", { d: "M5 19.5C5 15.9101 7.91015 13 11.5 13H12.5C16.0899 13 19 15.9101 19 19.5V20C19 20.5523 18.5523 21 18 21H6C5.44772 21 5 20.5523 5 20V19.5Z", stroke: strokeColor, "stroke-width": "2" })] })] }) }));
}

// regex for strings between 00:00 and 23:59
const timeStringRegex = /^(0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const dateTimeStringRegex = /^(\d{4})-(\d{2})-(\d{2}) (0[0-9]|1[0-9]|2[0-3]):[0-5][0-9]$/;
const dateStringRegex = /^(\d{4})-(\d{2})-(\d{2})$/;

class InvalidTimeStringError extends Error {
    constructor(timeString) {
        super(`Invalid time string: ${timeString}`);
    }
}

const minuteTimePointMultiplier = 1.6666666666666667; // 100 / 60
const timePointsFromString = (timeString) => {
    if (!timeStringRegex.test(timeString))
        throw new InvalidTimeStringError(timeString);
    const [hoursInt, minutesInt] = timeString
        .split(':')
        .map((time) => parseInt(time, 10));
    let minutePoints = (minutesInt * minuteTimePointMultiplier).toString();
    if (minutePoints.split('.')[0].length < 2)
        minutePoints = `0${minutePoints}`;
    return Number(hoursInt + minutePoints);
};
const timeStringFromTimePoints = (timePoints) => {
    const hours = Math.floor(timePoints / 100);
    const minutes = Math.round((timePoints % 100) / minuteTimePointMultiplier);
    return `${doubleDigit(hours)}:${doubleDigit(minutes)}`;
};
const addTimePointsToDateTime = (dateTimeString, pointsToAdd) => {
    const minutesToAdd = pointsToAdd / minuteTimePointMultiplier;
    const jsDate = toJSDate(dateTimeString);
    jsDate.setMinutes(jsDate.getMinutes() + minutesToAdd);
    return toDateTimeString(jsDate);
};

var WeekDay;
(function (WeekDay) {
    WeekDay[WeekDay["SUNDAY"] = 0] = "SUNDAY";
    WeekDay[WeekDay["MONDAY"] = 1] = "MONDAY";
    WeekDay[WeekDay["TUESDAY"] = 2] = "TUESDAY";
    WeekDay[WeekDay["WEDNESDAY"] = 3] = "WEDNESDAY";
    WeekDay[WeekDay["THURSDAY"] = 4] = "THURSDAY";
    WeekDay[WeekDay["FRIDAY"] = 5] = "FRIDAY";
    WeekDay[WeekDay["SATURDAY"] = 6] = "SATURDAY";
})(WeekDay || (WeekDay = {}));

const DEFAULT_LOCALE = 'en-US';
const DEFAULT_FIRST_DAY_OF_WEEK = WeekDay.MONDAY;
const DEFAULT_EVENT_COLOR_NAME = 'primary';

class CalendarEventImpl {
    constructor(_config, id, start, end, title, people, location, description, calendarId, link, _foreignProperties = {}) {
        Object.defineProperty(this, "_config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _config
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: start
        });
        Object.defineProperty(this, "end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: end
        });
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: title
        });
        Object.defineProperty(this, "people", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: people
        });
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: location
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: description
        });
        Object.defineProperty(this, "calendarId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: calendarId
        });
        Object.defineProperty(this, "link", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: link
        });
        Object.defineProperty(this, "_foreignProperties", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _foreignProperties
        });
        Object.defineProperty(this, "_previousConcurrentEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_totalConcurrentEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_nDaysInGrid", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_eventFragments", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
    }
    get _isSingleDayTimed() {
        return (dateTimeStringRegex.test(this.start) &&
            dateTimeStringRegex.test(this.end) &&
            dateFromDateTime(this.start) === dateFromDateTime(this.end));
    }
    get _isSingleDayFullDay() {
        return (dateStringRegex.test(this.start) &&
            dateStringRegex.test(this.end) &&
            this.start === this.end);
    }
    get _isMultiDayTimed() {
        return (dateTimeStringRegex.test(this.start) &&
            dateTimeStringRegex.test(this.end) &&
            dateFromDateTime(this.start) !== dateFromDateTime(this.end));
    }
    get _isMultiDayFullDay() {
        return (dateStringRegex.test(this.start) &&
            dateStringRegex.test(this.end) &&
            this.start !== this.end);
    }
    get _isSingleHybridDayTimed() {
        if (!this._config.isHybridDay)
            return false;
        if (!dateTimeStringRegex.test(this.start) ||
            !dateTimeStringRegex.test(this.end))
            return false;
        const startDate = dateFromDateTime(this.start);
        const endDate = dateFromDateTime(this.end);
        const endDateMinusOneDay = toDateString$1(new Date(toJSDate(endDate).getTime() - 86400000));
        if (startDate !== endDate && startDate !== endDateMinusOneDay)
            return false;
        const dayBoundaries = this._config.dayBoundaries;
        const eventStartTimePoints = timePointsFromString(timeFromDateTime(this.start));
        const eventEndTimePoints = timePointsFromString(timeFromDateTime(this.end));
        return ((eventStartTimePoints >= dayBoundaries.start &&
            (eventEndTimePoints <= dayBoundaries.end ||
                eventEndTimePoints > eventStartTimePoints)) ||
            (eventStartTimePoints < dayBoundaries.end &&
                eventEndTimePoints <= dayBoundaries.end));
    }
    get _color() {
        if (this.calendarId &&
            this._config.calendars.value &&
            this.calendarId in this._config.calendars.value) {
            return this._config.calendars.value[this.calendarId].colorName;
        }
        return DEFAULT_EVENT_COLOR_NAME;
    }
    _getForeignProperties() {
        return this._foreignProperties;
    }
    _getExternalEvent() {
        return {
            id: this.id,
            start: this.start,
            end: this.end,
            title: this.title,
            people: this.people,
            location: this.location,
            description: this.description,
            calendarId: this.calendarId,
            link: this.link,
            ...this._getForeignProperties(),
        };
    }
}

class CalendarEventBuilder {
    constructor(_config, id, start, end) {
        Object.defineProperty(this, "_config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _config
        });
        Object.defineProperty(this, "id", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: id
        });
        Object.defineProperty(this, "start", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: start
        });
        Object.defineProperty(this, "end", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: end
        });
        Object.defineProperty(this, "people", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "location", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "description", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "title", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendarId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "_foreignProperties", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "link", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new CalendarEventImpl(this._config, this.id, this.start, this.end, this.title, this.people, this.location, this.description, this.calendarId, this.link, this._foreignProperties);
    }
    withLink(link) {
        this.link = link;
        return this;
    }
    withTitle(title) {
        this.title = title;
        return this;
    }
    withPeople(people) {
        this.people = people;
        return this;
    }
    withLocation(location) {
        this.location = location;
        return this;
    }
    withDescription(description) {
        this.description = description;
        return this;
    }
    withForeignProperties(foreignProperties) {
        this._foreignProperties = foreignProperties;
        return this;
    }
    withCalendarId(calendarId) {
        this.calendarId = calendarId;
        return this;
    }
}

const deepCloneEvent = (calendarEvent, $app) => {
    const calendarEventInternal = new CalendarEventBuilder($app.config, calendarEvent.id, calendarEvent.start, calendarEvent.end)
        .withTitle(calendarEvent.title)
        .withPeople(calendarEvent.people)
        .withCalendarId(calendarEvent.calendarId)
        .withForeignProperties(JSON.parse(JSON.stringify(calendarEvent._getForeignProperties())))
        .withLocation(calendarEvent.location)
        .withDescription(calendarEvent.description)
        .build();
    calendarEventInternal._nDaysInGrid = calendarEvent._nDaysInGrid;
    return calendarEventInternal;
};

const concatenatePeople = (people) => {
    return people.reduce((acc, person, index) => {
        if (index === 0)
            return person;
        if (index === people.length - 1)
            return `${acc} & ${person}`;
        return `${acc}, ${person}`;
    }, '');
};

const dateFn = (dateTimeString, locale) => {
    const { year, month, date } = toIntegers(dateTimeString);
    return new Date(year, month, date).toLocaleDateString(locale, {
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });
};
const getLocalizedDate = dateFn;
const timeFn = (dateTimeString, locale) => {
    const { year, month, date, hours, minutes } = toIntegers(dateTimeString);
    return new Date(year, month, date, hours, minutes).toLocaleTimeString(locale, {
        hour: 'numeric',
        minute: 'numeric',
    });
};
const getTimeStamp = (calendarEvent, // to facilitate testing. In reality, we will always have a full CalendarEventInternal
locale, delimiter = '\u2013') => {
    const eventTime = { start: calendarEvent.start, end: calendarEvent.end };
    if (calendarEvent._isSingleDayFullDay) {
        return dateFn(eventTime.start, locale);
    }
    if (calendarEvent._isMultiDayFullDay) {
        return `${dateFn(eventTime.start, locale)} ${delimiter} ${dateFn(eventTime.end, locale)}`;
    }
    if (calendarEvent._isSingleDayTimed) {
        return `${dateFn(eventTime.start, locale)} ⋅ ${timeFn(eventTime.start, locale)} ${delimiter} ${timeFn(eventTime.end, locale)}`;
    }
    return `${dateFn(eventTime.start, locale)}, ${timeFn(eventTime.start, locale)} ${delimiter} ${dateFn(eventTime.end, locale)}, ${timeFn(eventTime.end, locale)}`;
};

function MonthViewWeek({ week }) {
    const $app = useContext(AppContext$1);
    const weekDays = week.map((day) => {
        const classes = ['sx__date-picker__day'];
        if (isToday(day))
            classes.push('sx__date-picker__day--today');
        if (toDateString$1(day) === $app.datePickerState.selectedDate.value)
            classes.push('sx__date-picker__day--selected');
        if (!isSameMonth(day, toJSDate($app.datePickerState.datePickerDate.value)))
            classes.push('is-leading-or-trailing');
        return {
            day,
            classes,
        };
    });
    const isDateSelectable = (date) => {
        const dateString = toDateString$1(date);
        return dateString >= $app.config.min && dateString <= $app.config.max;
    };
    const selectDate = (date) => {
        $app.datePickerState.selectedDate.value = toDateString$1(date);
        $app.datePickerState.close();
    };
    const hasFocus = (weekDay) => toDateString$1(weekDay.day) === $app.datePickerState.datePickerDate.value;
    const handleKeyDown = (event) => {
        if (event.key === 'Enter') {
            $app.datePickerState.selectedDate.value =
                $app.datePickerState.datePickerDate.value;
            $app.datePickerState.close();
            return;
        }
        const keyMapDaysToAdd = new Map([
            ['ArrowDown', 7],
            ['ArrowUp', -7],
            ['ArrowLeft', -1],
            ['ArrowRight', 1],
        ]);
        $app.datePickerState.datePickerDate.value = addDays($app.datePickerState.datePickerDate.value, keyMapDaysToAdd.get(event.key) || 0);
    };
    return (u(Fragment, { children: u("div", { "data-testid": DATE_PICKER_WEEK, className: "sx__date-picker__week", children: weekDays.map((weekDay) => (u("button", { tabIndex: hasFocus(weekDay) ? 0 : -1, disabled: !isDateSelectable(weekDay.day), "aria-label": getLocalizedDate($app.datePickerState.datePickerDate.value, $app.config.locale), className: weekDay.classes.join(' '), "data-focus": hasFocus(weekDay) ? 'true' : undefined, onClick: () => selectDate(weekDay.day), onKeyDown: handleKeyDown, children: weekDay.day.getDate() }))) }) }));
}

function MonthView({ seatYearsView }) {
    const elementId = randomStringId();
    const $app = useContext(AppContext$1);
    const [month, setMonth] = useState([]);
    const renderMonth = () => {
        const newDatePickerDate = toJSDate($app.datePickerState.datePickerDate.value);
        setMonth($app.timeUnitsImpl.getMonthWithTrailingAndLeadingDays(newDatePickerDate.getFullYear(), newDatePickerDate.getMonth()));
    };
    useEffect(() => {
        renderMonth();
    }, [$app.datePickerState.datePickerDate.value]);
    useEffect(() => {
        const observer = new MutationObserver((mutations) => {
            mutations.forEach((mutation) => {
                const mutatedElement = mutation.target;
                if (mutatedElement.dataset.focus === 'true')
                    mutatedElement.focus();
            });
        });
        const monthViewElement = document.getElementById(elementId);
        observer.observe(monthViewElement, {
            childList: true,
            subtree: true,
            attributes: true,
        });
        return () => observer.disconnect();
    }, []);
    return (u(Fragment, { children: u("div", { id: elementId, "data-testid": MONTH_VIEW, className: "sx__date-picker__month-view", children: [u(MonthViewHeader, { setYearsView: seatYearsView }), u(DayNames, {}), month.map((week) => (u(MonthViewWeek, { week: week })))] }) }));
}

function YearsViewAccordion({ year, setYearAndMonth, isExpanded, expand, }) {
    const $app = useContext(AppContext$1);
    const yearWithDates = $app.timeUnitsImpl.getMonthsFor(year);
    const handleClickOnMonth = (event, month) => {
        event.stopPropagation();
        setYearAndMonth(year, month.getMonth());
    };
    return (u(Fragment, { children: u("li", { className: isExpanded ? 'sx__is-expanded' : '', children: [u("button", { className: "sx__date-picker__years-accordion__expand-button sx__ripple--wide", onClick: () => expand(year), children: year }), isExpanded && (u("div", { className: "sx__date-picker__years-view-accordion__panel", children: yearWithDates.map((month) => (u("button", { className: "sx__date-picker__years-view-accordion__month", onClick: (event) => handleClickOnMonth(event, month), children: toLocalizedMonth(month, $app.config.locale) }))) }))] }) }));
}

function YearsView({ setMonthView }) {
    const $app = useContext(AppContext$1);
    const minYear = toJSDate($app.config.min).getFullYear();
    const maxYear = toJSDate($app.config.max).getFullYear();
    const years = Array.from({ length: maxYear - minYear + 1 }, (_, i) => minYear + i);
    const { year: selectedYear } = toIntegers($app.datePickerState.selectedDate.value);
    const [expandedYear, setExpandedYear] = useState(selectedYear);
    const setNewDatePickerDate = (year, month) => {
        $app.datePickerState.datePickerDate.value = toDateString$1(new Date(year, month, 1));
        setMonthView();
    };
    useEffect(() => {
        var _a;
        const initiallyExpandedYear = (_a = document
            .querySelector('.sx__date-picker__years-view')) === null || _a === void 0 ? void 0 : _a.querySelector('.sx__is-expanded');
        if (!initiallyExpandedYear)
            return;
        initiallyExpandedYear.scrollIntoView({
            block: 'center',
        });
    }, []);
    return (u(Fragment, { children: u("ul", { className: "sx__date-picker__years-view", "data-testid": YEARS_VIEW, children: years.map((year) => (u(YearsViewAccordion, { year: year, setYearAndMonth: (year, month) => setNewDatePickerDate(year, month), isExpanded: expandedYear === year, expand: (year) => setExpandedYear(year) }))) }) }));
}

const isScrollable = (el) => {
    if (el) {
        const hasScrollableContent = el.scrollHeight > el.clientHeight;
        const overflowYStyle = window.getComputedStyle(el).overflowY;
        const isOverflowHidden = overflowYStyle.indexOf('hidden') !== -1;
        return hasScrollableContent && !isOverflowHidden;
    }
    return true;
};
const getScrollableParents = (el, acc = []) => {
    if (!el ||
        el === document.body ||
        el.nodeType === Node.DOCUMENT_FRAGMENT_NODE) {
        acc.push(window);
        return acc;
    }
    if (isScrollable(el)) {
        acc.push(el);
    }
    return getScrollableParents((el.assignedSlot
        ? el.assignedSlot.parentNode
        : el.parentNode), acc);
};

const POPUP_CLASS_NAME = 'sx__date-picker-popup';
function AppPopup() {
    const $app = useContext(AppContext$1);
    const [datePickerView, setDatePickerView] = useState(DatePickerView.MONTH_DAYS);
    const popupClasses = [POPUP_CLASS_NAME, $app.config.placement];
    const clickOutsideListener = (event) => {
        const target = event.target;
        if (!target.closest(`.${POPUP_CLASS_NAME}`))
            $app.datePickerState.close();
    };
    useEffect(() => {
        document.addEventListener('click', clickOutsideListener);
        return () => document.removeEventListener('click', clickOutsideListener);
    }, []);
    const remSize = Number(getComputedStyle(document.documentElement).fontSize.split('px')[0]);
    const popupHeight = 362;
    const popupWidth = 332;
    const getFixedPositionStyles = () => {
        const inputWrapperEl = $app.datePickerState.inputWrapperElement.value;
        const inputRect = inputWrapperEl === null || inputWrapperEl === void 0 ? void 0 : inputWrapperEl.getBoundingClientRect();
        if (inputWrapperEl === undefined || !(inputRect instanceof DOMRect))
            return undefined;
        return {
            top: $app.config.placement.includes('bottom')
                ? inputRect.height + inputRect.y + 1 // 1px border
                : inputRect.y - remSize - popupHeight, // subtract remsize to leave room for label text
            left: $app.config.placement.includes('start')
                ? inputRect.x
                : inputRect.x + inputRect.width - popupWidth,
            width: popupWidth,
            position: 'fixed',
        };
    };
    const [fixedPositionStyle, setFixedPositionStyle] = useState(getFixedPositionStyles());
    useEffect(() => {
        const inputWrapper = $app.datePickerState.inputWrapperElement.value;
        if (inputWrapper === undefined)
            return;
        const scrollableParents = getScrollableParents(inputWrapper);
        const scrollListener = () => setFixedPositionStyle(getFixedPositionStyles());
        scrollableParents.forEach((parent) => parent.addEventListener('scroll', scrollListener));
        return () => scrollableParents.forEach((parent) => parent.removeEventListener('scroll', scrollListener));
    }, []);
    return (u(Fragment, { children: u("div", { style: $app.config.teleportTo ? fixedPositionStyle : undefined, "data-testid": "date-picker-popup", className: popupClasses.join(' '), children: datePickerView === DatePickerView.MONTH_DAYS ? (u(MonthView, { seatYearsView: () => setDatePickerView(DatePickerView.YEARS) })) : (u(YearsView, { setMonthView: () => setDatePickerView(DatePickerView.MONTH_DAYS) })) }) }));
}

function g(n,t){for(var e in t)n[e]=t[e];return n}function C(n,t){for(var e in n)if("__source"!==e&&!(e in t))return !0;for(var r in t)if("__source"!==r&&n[r]!==t[r])return !0;return !1}function E(n){this.props=n;}(E.prototype=new Component).isPureReactComponent=!0,E.prototype.shouldComponentUpdate=function(n,t){return C(this.props,n)||C(this.state,t)};var x=options.__b;options.__b=function(n){n.type&&n.type.__f&&n.ref&&(n.props.ref=n.ref,n.ref=null),x&&x(n);};var O=options.__e;options.__e=function(n,t,e,r){if(n.then)for(var u,o=t;o=o.__;)if((u=o.__c)&&u.__c)return null==t.__e&&(t.__e=e.__e,t.__k=e.__k),u.__c(n,t);O(n,t,e,r);};var T=options.unmount;function F(n,t,e){return n&&(n.__c&&n.__c.__H&&(n.__c.__H.__.forEach(function(n){"function"==typeof n.__c&&n.__c();}),n.__c.__H=null),null!=(n=g({},n)).__c&&(n.__c.__P===e&&(n.__c.__P=t),n.__c=null),n.__k=n.__k&&n.__k.map(function(n){return F(n,t,e)})),n}function I(n,t,e){return n&&e&&(n.__v=null,n.__k=n.__k&&n.__k.map(function(n){return I(n,t,e)}),n.__c&&n.__c.__P===t&&(n.__e&&e.appendChild(n.__e),n.__c.__e=!0,n.__c.__P=e)),n}function L(){this.__u=0,this.t=null,this.__b=null;}function U(n){var t=n.__.__c;return t&&t.__a&&t.__a(n)}function M(){this.u=null,this.o=null;}options.unmount=function(n){var t=n.__c;t&&t.__R&&t.__R(),t&&32&n.__u&&(n.type=null),T&&T(n);},(L.prototype=new Component).__c=function(n,t){var e=t.__c,r=this;null==r.t&&(r.t=[]),r.t.push(e);var u=U(r.__v),o=!1,i=function(){o||(o=!0,e.__R=null,u?u(l):l());};e.__R=i;var l=function(){if(!--r.__u){if(r.state.__a){var n=r.state.__a;r.__v.__k[0]=I(n,n.__c.__P,n.__c.__O);}var t;for(r.setState({__a:r.__b=null});t=r.t.pop();)t.forceUpdate();}};r.__u++||32&t.__u||r.setState({__a:r.__b=r.__v.__k[0]}),n.then(i,i);},L.prototype.componentWillUnmount=function(){this.t=[];},L.prototype.render=function(n,e){if(this.__b){if(this.__v.__k){var r=document.createElement("div"),o=this.__v.__k[0].__c;this.__v.__k[0]=F(this.__b,r,o.__O=o.__P);}this.__b=null;}var i=e.__a&&createElement(Fragment,null,n.fallback);return i&&(i.__u&=-33),[createElement(Fragment,null,e.__a?null:n.children),i]};var V=function(n,t,e){if(++e[1]===e[0]&&n.o.delete(t),n.props.revealOrder&&("t"!==n.props.revealOrder[0]||!n.o.size))for(e=n.u;e;){for(;e.length>3;)e.pop()();if(e[1]<e[0])break;n.u=e=e[2];}};function W(n){return this.getChildContext=function(){return n.context},n.children}function P(n){var e=this,r=n.i;e.componentWillUnmount=function(){render(null,e.l),e.l=null,e.i=null;},e.i&&e.i!==r&&e.componentWillUnmount(),e.l||(e.i=r,e.l={nodeType:1,parentNode:r,childNodes:[],appendChild:function(n){this.childNodes.push(n),e.i.appendChild(n);},insertBefore:function(n,t){this.childNodes.push(n),e.i.appendChild(n);},removeChild:function(n){this.childNodes.splice(this.childNodes.indexOf(n)>>>1,1),e.i.removeChild(n);}}),render(createElement(W,{context:e.context},n.__v),e.l);}function j(n,e){var r=createElement(P,{__v:n,i:e});return r.containerInfo=e,r}(M.prototype=new Component).__a=function(n){var t=this,e=U(t.__v),r=t.o.get(n);return r[0]++,function(u){var o=function(){t.props.revealOrder?(r.push(u),V(t,n,r)):u();};e?e(o):o();}},M.prototype.render=function(n){this.u=null,this.o=new Map;var t=toChildArray(n.children);n.revealOrder&&"b"===n.revealOrder[0]&&t.reverse();for(var e=t.length;e--;)this.o.set(t[e],this.u=[1,0,this.u]);return n.children},M.prototype.componentDidUpdate=M.prototype.componentDidMount=function(){var n=this;this.o.forEach(function(t,e){V(n,e,t);});};var z="undefined"!=typeof Symbol&&Symbol.for&&Symbol.for("react.element")||60103,B=/^(?:accent|alignment|arabic|baseline|cap|clip(?!PathU)|color|dominant|fill|flood|font|glyph(?!R)|horiz|image(!S)|letter|lighting|marker(?!H|W|U)|overline|paint|pointer|shape|stop|strikethrough|stroke|text(?!L)|transform|underline|unicode|units|v|vector|vert|word|writing|x(?!C))[A-Z]/,H=/^on(Ani|Tra|Tou|BeforeInp|Compo)/,Z=/[A-Z0-9]/g,Y="undefined"!=typeof document,$=function(n){return ("undefined"!=typeof Symbol&&"symbol"==typeof Symbol()?/fil|che|rad/:/fil|che|ra/).test(n)};Component.prototype.isReactComponent={},["componentWillMount","componentWillReceiveProps","componentWillUpdate"].forEach(function(t){Object.defineProperty(Component.prototype,t,{configurable:!0,get:function(){return this["UNSAFE_"+t]},set:function(n){Object.defineProperty(this,t,{configurable:!0,writable:!0,value:n});}});});var J=options.event;function K(){}function Q(){return this.cancelBubble}function X(){return this.defaultPrevented}options.event=function(n){return J&&(n=J(n)),n.persist=K,n.isPropagationStopped=Q,n.isDefaultPrevented=X,n.nativeEvent=n};var tn={enumerable:!1,configurable:!0,get:function(){return this.class}},en=options.vnode;options.vnode=function(n){"string"==typeof n.type&&function(n){var t=n.props,e=n.type,u={};for(var o in t){var i=t[o];if(!("value"===o&&"defaultValue"in t&&null==i||Y&&"children"===o&&"noscript"===e||"class"===o||"className"===o)){var l=o.toLowerCase();"defaultValue"===o&&"value"in t&&null==t.value?o="value":"download"===o&&!0===i?i="":"ondoubleclick"===l?o="ondblclick":"onchange"!==l||"input"!==e&&"textarea"!==e||$(t.type)?"onfocus"===l?o="onfocusin":"onblur"===l?o="onfocusout":H.test(o)?o=l:-1===e.indexOf("-")&&B.test(o)?o=o.replace(Z,"-$&").toLowerCase():null===i&&(i=void 0):l=o="oninput","oninput"===l&&u[o=l]&&(o="oninputCapture"),u[o]=i;}}"select"==e&&u.multiple&&Array.isArray(u.value)&&(u.value=toChildArray(t.children).forEach(function(n){n.props.selected=-1!=u.value.indexOf(n.props.value);})),"select"==e&&null!=u.defaultValue&&(u.value=toChildArray(t.children).forEach(function(n){n.props.selected=u.multiple?-1!=u.defaultValue.indexOf(n.props.value):u.defaultValue==n.props.value;})),t.class&&!t.className?(u.class=t.class,Object.defineProperty(u,"className",tn)):(t.className&&!t.class||t.class&&t.className)&&(u.class=u.className=t.className),n.props=u;}(n),n.$$typeof=z,en&&en(n);};var rn=options.__r;options.__r=function(n){rn&&rn(n),n.__c;};var un=options.diffed;options.diffed=function(n){un&&un(n);var t=n.props,e=n.__e;null!=e&&"textarea"===n.type&&"value"in t&&t.value!==e.value&&(e.value=null==t.value?"":t.value);};

function AppWrapper({ $app }) {
    var _a, _b;
    const classes = ['sx__date-picker-wrapper'];
    if ((_a = $app.config.style) === null || _a === void 0 ? void 0 : _a.dark)
        classes.push('is-dark');
    if ((_b = $app.config.style) === null || _b === void 0 ? void 0 : _b.fullWidth)
        classes.push('has-full-width');
    let appPopupJSX = u(AppPopup, {});
    if ($app.config.teleportTo)
        appPopupJSX = j(appPopupJSX, $app.config.teleportTo);
    return (u(Fragment, { children: u("div", { className: classes.join(' '), children: u(AppContext$1.Provider, { value: $app, children: [u(AppInput, {}), $app.datePickerState.isOpen.value && appPopupJSX] }) }) }));
}

const AppContext = createContext({});

class DatePickerAppSingletonImpl {
    constructor(datePickerState, config, timeUnitsImpl, translate) {
        Object.defineProperty(this, "datePickerState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: datePickerState
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "timeUnitsImpl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: timeUnitsImpl
        });
        Object.defineProperty(this, "translate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: translate
        });
    }
}

class DatePickerAppSingletonBuilder {
    constructor() {
        Object.defineProperty(this, "datePickerState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeUnitsImpl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "translate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new DatePickerAppSingletonImpl(this.datePickerState, this.config, this.timeUnitsImpl, this.translate);
    }
    withDatePickerState(datePickerState) {
        this.datePickerState = datePickerState;
        return this;
    }
    withConfig(config) {
        this.config = config;
        return this;
    }
    withTimeUnitsImpl(timeUnitsImpl) {
        this.timeUnitsImpl = timeUnitsImpl;
        return this;
    }
    withTranslate(translate) {
        this.translate = translate;
        return this;
    }
}

// This enum is used to represent names of all internally built views of the calendar
var InternalViewName;
(function (InternalViewName) {
    InternalViewName["Day"] = "day";
    InternalViewName["Week"] = "week";
    InternalViewName["MonthGrid"] = "month-grid";
    InternalViewName["MonthAgenda"] = "month-agenda";
})(InternalViewName || (InternalViewName = {}));

const getLocaleStringMonthArgs = ($app) => {
    return [$app.config.locale, { month: 'long' }];
};
const getLocaleStringYearArgs = ($app) => {
    return [$app.config.locale, { year: 'numeric' }];
};
const getMonthAndYearForDateRange = ($app, rangeStart, rangeEnd) => {
    const startDateMonth = toJSDate(rangeStart).toLocaleString(...getLocaleStringMonthArgs($app));
    const startDateYear = toJSDate(rangeStart).toLocaleString(...getLocaleStringYearArgs($app));
    const endDateMonth = toJSDate(rangeEnd).toLocaleString(...getLocaleStringMonthArgs($app));
    const endDateYear = toJSDate(rangeEnd).toLocaleString(...getLocaleStringYearArgs($app));
    if (startDateMonth === endDateMonth && startDateYear === endDateYear) {
        return `${startDateMonth} ${startDateYear}`;
    }
    else if (startDateMonth !== endDateMonth && startDateYear === endDateYear) {
        return `${startDateMonth} – ${endDateMonth} ${startDateYear}`;
    }
    return `${startDateMonth} ${startDateYear} – ${endDateMonth} ${endDateYear}`;
};
const getMonthAndYearForSelectedDate = ($app) => {
    const dateMonth = toJSDate($app.datePickerState.selectedDate.value).toLocaleString(...getLocaleStringMonthArgs($app));
    const dateYear = toJSDate($app.datePickerState.selectedDate.value).toLocaleString(...getLocaleStringYearArgs($app));
    return `${dateMonth} ${dateYear}`;
};

function RangeHeading() {
    const $app = useContext(AppContext);
    const [currentHeading, setCurrentHeading] = useState('');
    useEffect(() => {
        if ($app.calendarState.view.value === InternalViewName.Week) {
            setCurrentHeading(getMonthAndYearForDateRange($app, $app.calendarState.range.value.start, $app.calendarState.range.value.end));
        }
        if ($app.calendarState.view.value === InternalViewName.MonthGrid ||
            $app.calendarState.view.value === InternalViewName.Day ||
            $app.calendarState.view.value === InternalViewName.MonthAgenda) {
            setCurrentHeading(getMonthAndYearForSelectedDate($app));
        }
    }, [$app.calendarState.range.value]);
    return u("span", { className: 'sx__range-heading', children: currentHeading });
}

function TodayButton() {
    const $app = useContext(AppContext);
    const setToday = () => {
        $app.datePickerState.selectedDate.value = toDateString$1(new Date());
    };
    return (u("button", { className: 'sx__today-button sx__ripple', onClick: setToday, children: $app.translate('Today') }));
}

function ViewSelection() {
    const $app = useContext(AppContext);
    const [availableViews, setAvailableViews] = useState([]);
    useEffect(() => {
        if ($app.calendarState.isCalendarSmall.value) {
            setAvailableViews($app.config.views.filter((view) => view.hasSmallScreenCompat));
        }
        else {
            setAvailableViews($app.config.views.filter((view) => view.hasWideScreenCompat));
        }
    }, [$app.calendarState.isCalendarSmall.value]);
    const [selectedViewLabel, setSelectedViewLabel] = useState('');
    useEffect(() => {
        const selectedView = $app.config.views.find((view) => view.name === $app.calendarState.view.value);
        if (!selectedView)
            return;
        setSelectedViewLabel($app.translate(selectedView.label));
    }, [$app.calendarState.view.value]);
    const [isOpen, setIsOpen] = useState(false);
    const clickOutsideListener = (event) => {
        const target = event.target;
        if (target instanceof HTMLElement &&
            !target.closest('.sx__view-selection')) {
            setIsOpen(false);
        }
    };
    useEffect(() => {
        document.addEventListener('click', clickOutsideListener);
        return () => document.removeEventListener('click', clickOutsideListener);
    }, []);
    const handleClickOnSelectionItem = (viewName) => {
        setIsOpen(false);
        $app.calendarState.view.value = viewName;
        $app.calendarState.setRange($app.datePickerState.selectedDate.value);
    };
    const [viewSelectionItems, setViewSelectionItems] = useState();
    const [focusedViewIndex, setFocusedViewIndex] = useState(0);
    const handleSelectedViewKeyDown = (keyboardEvent) => {
        if (isKeyEnterOrSpace(keyboardEvent)) {
            setIsOpen(!isOpen);
        }
        setTimeout(() => {
            var _a;
            const allOptions = (_a = $app.elements.calendarWrapper) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.sx__view-selection-item');
            if (!allOptions)
                return;
            setViewSelectionItems(allOptions);
            const firstOption = allOptions[0];
            if (firstOption instanceof HTMLElement) {
                setFocusedViewIndex(0);
                firstOption.focus();
            }
        }, 50);
    };
    const navigateUpOrDown = (keyboardEvent, viewName) => {
        if (!viewSelectionItems)
            return;
        if (keyboardEvent.key === 'ArrowDown') {
            const nextOption = viewSelectionItems[focusedViewIndex + 1];
            if (nextOption instanceof HTMLElement) {
                setFocusedViewIndex(focusedViewIndex + 1);
                nextOption.focus();
            }
        }
        else if (keyboardEvent.key === 'ArrowUp') {
            const prevOption = viewSelectionItems[focusedViewIndex - 1];
            if (prevOption instanceof HTMLElement) {
                setFocusedViewIndex(focusedViewIndex - 1);
                prevOption.focus();
            }
        }
        else if (isKeyEnterOrSpace(keyboardEvent)) {
            handleClickOnSelectionItem(viewName);
        }
    };
    return (u("div", { className: "sx__view-selection", children: [u("div", { tabIndex: 0, role: "button", "aria-label": $app.translate('Select View'), className: "sx__view-selection-selected-item sx__ripple", onClick: () => setIsOpen(!isOpen), onKeyDown: handleSelectedViewKeyDown, children: selectedViewLabel }), isOpen && (u("ul", { "data-testid": "view-selection-items", className: "sx__view-selection-items", children: availableViews.map((view) => (u("li", { "aria-label": $app.translate('Select View') + ' ' + $app.translate(view.label), tabIndex: -1, role: "button", onKeyDown: (keyboardEvent) => navigateUpOrDown(keyboardEvent, view.name), onClick: () => handleClickOnSelectionItem(view.name), className: 'sx__view-selection-item' +
                        (view.name === $app.calendarState.view.value
                            ? ' is-selected'
                            : ''), children: $app.translate(view.label) }))) }))] }));
}

function ForwardBackwardNavigation() {
    const $app = useContext(AppContext);
    const navigate = (direction) => {
        const currentView = $app.config.views.find((view) => view.name === $app.calendarState.view.value);
        if (!currentView)
            return;
        $app.datePickerState.selectedDate.value = currentView.backwardForwardFn($app.datePickerState.selectedDate.value, direction === 'forwards'
            ? currentView.backwardForwardUnits
            : -currentView.backwardForwardUnits);
    };
    const [localizedRange, setLocalizedRange] = useState('');
    useEffect(() => {
        setLocalizedRange(`${getLocalizedDate($app.calendarState.range.value.start, $app.config.locale)} ${$app.translate('to')} ${getLocalizedDate($app.calendarState.range.value.end, $app.config.locale)}`);
    }, [$app.calendarState.range.value]);
    const [rangeEndMinusOneRange, setRangeEndMinusOneRange] = useState('');
    const [rangeStartPlusOneRange, setRangeStartPlusOneRange] = useState('');
    useEffect(() => {
        const selectedView = $app.config.views.find((view) => view.name === $app.calendarState.view.value);
        if (!selectedView)
            return;
        setRangeEndMinusOneRange(selectedView.setDateRange({
            range: $app.calendarState.range,
            calendarConfig: $app.config,
            timeUnitsImpl: $app.timeUnitsImpl,
            date: selectedView.backwardForwardFn($app.datePickerState.selectedDate.value, -selectedView.backwardForwardUnits),
        }).end);
        setRangeStartPlusOneRange(selectedView.setDateRange({
            range: $app.calendarState.range,
            calendarConfig: $app.config,
            timeUnitsImpl: $app.timeUnitsImpl,
            date: selectedView.backwardForwardFn($app.datePickerState.selectedDate.value, selectedView.backwardForwardUnits),
        }).start);
    }, [$app.datePickerState.selectedDate.value, $app.calendarState.view.value]);
    return (u(Fragment, { children: u("div", { className: "sx__forward-backward-navigation", "aria-label": localizedRange, "aria-live": "polite", children: [u(Chevron, { disabled: !!($app.config.minDate &&
                        dateFromDateTime(rangeEndMinusOneRange) < $app.config.minDate), onClick: () => navigate('backwards'), direction: 'previous', buttonText: $app.translate('Previous period') }), u(Chevron, { disabled: !!($app.config.maxDate &&
                        dateFromDateTime(rangeStartPlusOneRange) > $app.config.maxDate), onClick: () => navigate('forwards'), direction: 'next', buttonText: $app.translate('Next period') })] }) }));
}

function CustomMenu({ menuOpts }) {
    const $app = useContext(AppContext);
    const [selectedValue, setSelectedValue] = useState(menuOpts.options[menuOpts.defaultSelectedIndex || 0]);
    useEffect(() => {
        var _a;
        (_a = menuOpts.onClick) === null || _a === void 0 ? void 0 : _a.call(menuOpts, selectedValue);
    }, [selectedValue]);
    const [isOpen, setIsOpen] = useState(false);
    const clickOutsideListener = (event) => {
        const target = event.target;
        if (target instanceof HTMLElement &&
            !target.closest('.sx__view-selection')) {
            setIsOpen(false);
        }
    };
    useEffect(() => {
        document.addEventListener('click', clickOutsideListener);
        return () => document.removeEventListener('click', clickOutsideListener);
    }, []);
    const handleClickOnSelectionItem = (value) => {
        setSelectedValue(value);
        setIsOpen(false);
    };
    const [show, setShow] = useState(true);
    useEffect(() => {
        setShow(!$app.calendarState.isCalendarSmall.value);
    }, [$app.calendarState.isCalendarSmall.value]);
    const [viewSelectionItems, setViewSelectionItems] = useState();
    const [focusedViewIndex, setFocusedViewIndex] = useState(0);
    const handleSelectedViewKeyDown = (keyboardEvent) => {
        if (isKeyEnterOrSpace(keyboardEvent)) {
            setIsOpen(!isOpen);
        }
        setTimeout(() => {
            var _a;
            const allOptions = (_a = $app.elements.calendarWrapper) === null || _a === void 0 ? void 0 : _a.querySelectorAll('.sx__view-selection-item');
            if (!allOptions)
                return;
            setViewSelectionItems(allOptions);
            const firstOption = allOptions[0];
            if (firstOption instanceof HTMLElement) {
                setFocusedViewIndex(0);
                firstOption.focus();
            }
        }, 50);
    };
    const navigateUpOrDown = (keyboardEvent, viewName) => {
        if (!viewSelectionItems)
            return;
        if (keyboardEvent.key === 'ArrowDown') {
            const nextOption = viewSelectionItems[focusedViewIndex + 1];
            if (nextOption instanceof HTMLElement) {
                setFocusedViewIndex(focusedViewIndex + 1);
                nextOption.focus();
            }
        }
        else if (keyboardEvent.key === 'ArrowUp') {
            const prevOption = viewSelectionItems[focusedViewIndex - 1];
            if (prevOption instanceof HTMLElement) {
                setFocusedViewIndex(focusedViewIndex - 1);
                prevOption.focus();
            }
        }
        else if (isKeyEnterOrSpace(keyboardEvent)) {
            handleClickOnSelectionItem(viewName);
        }
    };
    return (u(Fragment, { children: show &&
            u("div", { className: "sx__view-selection", children: [u("div", { tabIndex: 0, role: "button", "aria-label": 'Custom menu', className: "sx__view-selection-selected-item sx__ripple", onClick: () => setIsOpen(!isOpen), onKeyDown: handleSelectedViewKeyDown, children: u("div", { dangerouslySetInnerHTML: { __html: selectedValue.label } }) }), isOpen && (u("ul", { "data-testid": "view-selection-items", className: "sx__view-selection-items", children: menuOpts.options.map((opt) => (u("li", { "aria-label": opt.label, tabIndex: -1, role: "button", onKeyDown: (keyboardEvent) => navigateUpOrDown(keyboardEvent, opt), onClick: () => handleClickOnSelectionItem(opt), className: 'sx__view-selection-item' +
                                (opt.value === selectedValue.value
                                    ? ' is-selected'
                                    : ''), children: u("div", { dangerouslySetInnerHTML: { __html: opt.label } }) }))) }))] }) }));
}

function CalendarHeader() {
    var _a;
    const $app = useContext(AppContext);
    const datePickerAppSingleton = new DatePickerAppSingletonBuilder()
        .withDatePickerState($app.datePickerState)
        .withConfig($app.datePickerConfig)
        .withTranslate($app.translate)
        .withTimeUnitsImpl($app.timeUnitsImpl)
        .build();
    return (u("header", { className: 'sx__calendar-header', children: [u("div", { className: 'sx__calendar-header-content', children: [u(TodayButton, {}), u(ForwardBackwardNavigation, {}), u(RangeHeading, {})] }), u("div", { className: 'sx__calendar-header-content', children: [(_a = $app.config.customMenus) === null || _a === void 0 ? void 0 : _a.map((menuOpts) => {
                        return menuOpts.options.length ? u(CustomMenu, { menuOpts: menuOpts }) : null;
                    }), u(ViewSelection, {}), u(AppWrapper, { "$app": datePickerAppSingleton })] })] }));
}

const setWrapperElement = ($app, calendarId) => {
    $app.elements.calendarWrapper = document.getElementById(calendarId);
};

const setScreenSizeCompatibleView = ($app, isSmall) => {
    const currentView = $app.config.views.find((view) => view.name === $app.calendarState.view.value);
    if (isSmall) {
        if (currentView.hasSmallScreenCompat)
            return;
        const smallScreenCompatibleView = $app.config.views.find((view) => view.hasSmallScreenCompat);
        if (smallScreenCompatibleView)
            $app.calendarState.view.value = smallScreenCompatibleView.name;
    }
    else {
        if (currentView.hasWideScreenCompat)
            return;
        const wideScreenCompatibleView = $app.config.views.find((view) => view.hasWideScreenCompat);
        if (wideScreenCompatibleView)
            $app.calendarState.view.value = wideScreenCompatibleView.name;
    }
};
const handleWindowResize = ($app) => {
    const documentRoot = document.documentElement;
    const calendarRoot = $app.elements.calendarWrapper;
    const documentFontSize = +window
        .getComputedStyle(documentRoot)
        .fontSize.split('p')[0];
    const breakPointFor1RemEquals16px = 700;
    const multiplier = 16 / documentFontSize;
    const smallCalendarBreakpoint = breakPointFor1RemEquals16px / multiplier; // For 16px root font-size, break point is at 43.75rem
    if (!calendarRoot)
        return;
    const isSmall = calendarRoot.clientWidth < smallCalendarBreakpoint;
    const didIsSmallScreenChange = isSmall !== $app.calendarState.isCalendarSmall.value;
    if (!didIsSmallScreenChange)
        return;
    $app.calendarState.isCalendarSmall.value = isSmall;
    setScreenSizeCompatibleView($app, isSmall);
};

function useWrapperClasses($app) {
    const calendarWrapperClass = 'sx__calendar-wrapper';
    const [wrapperClasses, setWrapperClasses] = useState([
        calendarWrapperClass,
    ]);
    useEffect(() => {
        const classes = [calendarWrapperClass];
        if ($app.calendarState.isCalendarSmall.value)
            classes.push('sx__is-calendar-small');
        if ($app.calendarState.isDark.value)
            classes.push('is-dark');
        setWrapperClasses(classes);
    }, [
        $app.calendarState.isCalendarSmall.value,
        $app.calendarState.isDark.value,
    ]);
    return wrapperClasses;
}

const initPlugins = ($app) => {
    Object.values($app.config.plugins).forEach((plugin) => {
        if (plugin === null || plugin === void 0 ? void 0 : plugin.init) {
            plugin.init($app);
        }
    });
};
const destroyPlugins = ($app) => {
    Object.values($app.config.plugins).forEach((plugin) => {
        if (plugin === null || plugin === void 0 ? void 0 : plugin.destroy)
            plugin.destroy();
    });
};

function CalendarWrapper({ $app }) {
    var _a;
    const calendarId = randomStringId();
    const viewContainerId = randomStringId();
    useEffect(() => {
        setWrapperElement($app, calendarId);
        initPlugins($app);
        return () => destroyPlugins($app);
    }, []);
    const onResize = () => {
        handleWindowResize($app);
    };
    useEffect(() => {
        onResize();
        window.addEventListener('resize', onResize);
        return () => window.removeEventListener('resize', onResize);
    }, []);
    const wrapperClasses = useWrapperClasses($app);
    const [currentView, setCurrentView] = useState();
    const renderSelectedView = () => {
        const newView = $app.config.views.find((view) => view.name === $app.calendarState.view.value);
        const viewElement = document.getElementById(viewContainerId);
        if (!newView || !viewElement || newView.name === (currentView === null || currentView === void 0 ? void 0 : currentView.name))
            return;
        if (currentView)
            currentView.destroy();
        setCurrentView(newView);
        newView.render(viewElement, $app);
    };
    useEffect(renderSelectedView, [$app.calendarState.view.value]);
    const [previousRangeStart, setPreviousRangeStart] = useState('');
    const [transitionClass, setTransitionClass] = useState('');
    useEffect(() => {
        var _a, _b;
        const newRangeStartIsLaterThanPrevious = (((_a = $app.calendarState.range.value) === null || _a === void 0 ? void 0 : _a.start) || '') > previousRangeStart;
        setTransitionClass(newRangeStartIsLaterThanPrevious ? 'sx__slide-left' : 'sx__slide-right');
        setTimeout(() => {
            setTransitionClass('');
        }, 300); // CORRELATION ID: 3
        setPreviousRangeStart(((_b = $app.calendarState.range.value) === null || _b === void 0 ? void 0 : _b.start) || '');
    }, [$app.calendarState.range.value]);
    return (u(Fragment, { children: u("div", { className: wrapperClasses.join(' '), id: calendarId, children: u("div", { className: 'sx__calendar', children: u(AppContext.Provider, { value: $app, children: [u(CalendarHeader, {}), u("div", { className: ['sx__view-container', transitionClass].join(' '), id: viewContainerId }), $app.config.plugins.eventModal &&
                            $app.config.plugins.eventModal.calendarEvent.value && (u($app.config.plugins.eventModal.ComponentFn, { "$app": $app }, (_a = $app.config.plugins.eventModal.calendarEvent.value) === null || _a === void 0 ? void 0 : _a.id))] }) }) }) }));
}

const externalEventToInternal = (event, config) => {
    const { id, start, end, title, description, location, people, link, ...foreignProperties } = event;
    return new CalendarEventBuilder(config, id, start, end)
        .withTitle(title)
        .withDescription(description)
        .withLocation(location)
        .withPeople(people)
        .withCalendarId(event.calendarId)
        .withLink(link)
        .withForeignProperties(foreignProperties)
        .build();
};

class EventsFacadeImpl {
    constructor($app) {
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: $app
        });
    }
    set(events) {
        this.$app.calendarEvents.list.value = events.map((event) => externalEventToInternal(event, this.$app.config));
    }
    add(event) {
        const newEvent = externalEventToInternal(event, this.$app.config);
        const copiedEvents = [...this.$app.calendarEvents.list.value];
        copiedEvents.push(newEvent);
        this.$app.calendarEvents.list.value = copiedEvents;
    }
    get(id) {
        var _a;
        return (_a = this.$app.calendarEvents.list.value
            .find((event) => event.id === id)) === null || _a === void 0 ? void 0 : _a._getExternalEvent();
    }
    getAll() {
        return this.$app.calendarEvents.list.value.map((event) => event._getExternalEvent());
    }
    remove(id) {
        const index = this.$app.calendarEvents.list.value.findIndex((event) => event.id === id);
        const copiedEvents = [...this.$app.calendarEvents.list.value];
        copiedEvents.splice(index, 1);
        this.$app.calendarEvents.list.value = copiedEvents;
    }
    update(event) {
        const index = this.$app.calendarEvents.list.value.findIndex((e) => e.id === event.id);
        const copiedEvents = [...this.$app.calendarEvents.list.value];
        copiedEvents.splice(index, 1, externalEventToInternal(event, this.$app.config));
        this.$app.calendarEvents.list.value = copiedEvents;
    }
}

class CalendarApp {
    constructor($app) {
        Object.defineProperty(this, "$app", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: $app
        });
        Object.defineProperty(this, "events", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.events = new EventsFacadeImpl(this.$app);
    }
    render(el) {
        render(createElement(CalendarWrapper, { $app: this.$app }), el);
    }
    setTheme(theme) {
        this.$app.calendarState.isDark.value = theme === 'dark';
    }
    /**
     * @internal
     * Purpose: To be consumed by framework adapters for custom component rendering.
     * */
    _setCustomComponentFn(fnId, fn) {
        this.$app.config._customComponentFns[fnId] = fn;
    }
}

class CalendarAppSingletonImpl {
    constructor(config, timeUnitsImpl, calendarState, datePickerState, translate, datePickerConfig, calendarEvents, elements = { calendarWrapper: undefined }) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
        Object.defineProperty(this, "timeUnitsImpl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: timeUnitsImpl
        });
        Object.defineProperty(this, "calendarState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: calendarState
        });
        Object.defineProperty(this, "datePickerState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: datePickerState
        });
        Object.defineProperty(this, "translate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: translate
        });
        Object.defineProperty(this, "datePickerConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: datePickerConfig
        });
        Object.defineProperty(this, "calendarEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: calendarEvents
        });
        Object.defineProperty(this, "elements", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: elements
        });
    }
}

class CalendarAppSingletonBuilder {
    constructor() {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "timeUnitsImpl", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "datePickerState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendarState", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "translate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "datePickerConfig", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendarEvents", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new CalendarAppSingletonImpl(this.config, this.timeUnitsImpl, this.calendarState, this.datePickerState, this.translate, this.datePickerConfig, this.calendarEvents);
    }
    withConfig(config) {
        this.config = config;
        return this;
    }
    withTimeUnitsImpl(timeUnitsImpl) {
        this.timeUnitsImpl = timeUnitsImpl;
        return this;
    }
    withDatePickerState(datePickerState) {
        this.datePickerState = datePickerState;
        return this;
    }
    withCalendarState(calendarState) {
        this.calendarState = calendarState;
        return this;
    }
    withTranslate(translate) {
        this.translate = translate;
        return this;
    }
    withDatePickerConfig(datePickerConfig) {
        this.datePickerConfig = datePickerConfig;
        return this;
    }
    withCalendarEvents(calendarEvents) {
        this.calendarEvents = calendarEvents;
        return this;
    }
}

var DateFormatDelimiter;
(function (DateFormatDelimiter) {
    DateFormatDelimiter["SLASH"] = "/";
    DateFormatDelimiter["DASH"] = "-";
    DateFormatDelimiter["PERIOD"] = ".";
})(DateFormatDelimiter || (DateFormatDelimiter = {}));
var DateFormatOrder;
(function (DateFormatOrder) {
    DateFormatOrder["DMY"] = "DMY";
    DateFormatOrder["MDY"] = "MDY";
    DateFormatOrder["YMD"] = "YMD";
})(DateFormatOrder || (DateFormatOrder = {}));

const formatRules = {
    slashMDY: {
        delimiter: DateFormatDelimiter.SLASH,
        order: DateFormatOrder.MDY,
    },
    slashDMY: {
        delimiter: DateFormatDelimiter.SLASH,
        order: DateFormatOrder.DMY,
    },
    slashYMD: {
        delimiter: DateFormatDelimiter.SLASH,
        order: DateFormatOrder.YMD,
    },
    periodDMY: {
        delimiter: DateFormatDelimiter.PERIOD,
        order: DateFormatOrder.DMY,
    },
    dashYMD: {
        delimiter: DateFormatDelimiter.DASH,
        order: DateFormatOrder.YMD,
    },
};
const dateFormatLocalizedRules = new Map([
    ['en-US', formatRules.slashMDY],
    ['en-GB', formatRules.slashDMY],
    ['zh-CN', formatRules.slashYMD],
    ['de-DE', formatRules.periodDMY],
    ['sv-SE', formatRules.dashYMD],
]);

class LocaleNotSupportedError extends Error {
    constructor(locale) {
        super(`Locale not supported: ${locale}`);
    }
}

class InvalidDateFormatError extends Error {
    constructor(dateFormat, locale) {
        super(`Invalid date format: ${dateFormat} for locale: ${locale}`);
    }
}

const _getMatchesOrThrow = (format, matcher, locale) => {
    const matches = format.match(matcher);
    if (!matches)
        throw new InvalidDateFormatError(format, locale);
    return matches;
};
const toDateString = (format, locale) => {
    const internationalFormat = /^\d{4}-\d{2}-\d{2}$/;
    if (internationalFormat.test(format))
        return format; // allow international format regardless of locale
    const localeDateFormatRule = dateFormatLocalizedRules.get(locale);
    if (!localeDateFormatRule)
        throw new LocaleNotSupportedError(locale);
    const { order, delimiter } = localeDateFormatRule;
    const pattern224Slashed = /^(\d{1,2})\/(\d{1,2})\/(\d{4})$/;
    const pattern224Dotted = /^(\d{1,2})\.(\d{1,2})\.(\d{4})$/;
    const pattern442Slashed = /^(\d{4})\/(\d{1,2})\/(\d{1,2})$/;
    if (order === DateFormatOrder.DMY && delimiter === DateFormatDelimiter.SLASH) {
        const matches = _getMatchesOrThrow(format, pattern224Slashed, locale);
        const [, day, month, year] = matches;
        return `${year}-${doubleDigit(+month)}-${doubleDigit(+day)}`;
    }
    if (order === DateFormatOrder.MDY && delimiter === DateFormatDelimiter.SLASH) {
        const matches = _getMatchesOrThrow(format, pattern224Slashed, locale);
        const [, month, day, year] = matches;
        return `${year}-${doubleDigit(+month)}-${doubleDigit(+day)}`;
    }
    if (order === DateFormatOrder.YMD && delimiter === DateFormatDelimiter.SLASH) {
        const matches = _getMatchesOrThrow(format, pattern442Slashed, locale);
        const [, year, month, day] = matches;
        return `${year}-${doubleDigit(+month)}-${doubleDigit(+day)}`;
    }
    if (order === DateFormatOrder.DMY && delimiter === DateFormatDelimiter.PERIOD) {
        const matches = _getMatchesOrThrow(format, pattern224Dotted, locale);
        const [, day, month, year] = matches;
        return `${year}-${doubleDigit(+month)}-${doubleDigit(+day)}`;
    }
    throw new InvalidDateFormatError(format, locale);
};

const createDatePickerState = (config, selectedDateParam) => {
    const currentDayDateString = toDateString$1(new Date());
    const initialSelectedDate = typeof selectedDateParam === 'string'
        ? selectedDateParam
        : currentDayDateString;
    const isOpen = signal(false);
    const datePickerView = signal(DatePickerView.MONTH_DAYS);
    const selectedDate = signal(initialSelectedDate);
    const datePickerDate = signal(initialSelectedDate || currentDayDateString);
    const inputDisplayedValue = signal(selectedDateParam || '');
    const lastValidDisplayedValue = signal(selectedDateParam || '');
    effect(() => {
        try {
            const newValue = toDateString(inputDisplayedValue.value, config.locale);
            if (newValue < config.min || newValue > config.max) {
                inputDisplayedValue.value = lastValidDisplayedValue.value;
                return;
            }
            selectedDate.value = newValue;
            datePickerDate.value = newValue;
            lastValidDisplayedValue.value = inputDisplayedValue.value;
        }
        catch (e) {
            // nothing to do
        }
    });
    let wasInitialized = false;
    const handleOnChange = (selectedDate) => {
        if (!wasInitialized)
            return (wasInitialized = true);
        config.listeners.onChange(selectedDate);
    };
    effect(() => {
        var _a;
        if ((_a = config.listeners) === null || _a === void 0 ? void 0 : _a.onChange)
            handleOnChange(selectedDate.value);
    });
    return {
        inputWrapperElement: signal(undefined),
        isOpen,
        datePickerView,
        selectedDate,
        datePickerDate,
        inputDisplayedValue,
        open: () => (isOpen.value = true),
        close: () => (isOpen.value = false),
        toggle: () => (isOpen.value = !isOpen.value),
        setView: (view) => (datePickerView.value = view),
    };
};

const datePickerDeDE = {
    Date: 'Datum',
    'MM/DD/YYYY': 'TT.MM.JJJJ',
    'Next month': 'Nächster Monat',
    'Previous month': 'Vorheriger Monat',
    'Choose Date': 'Datum auswählen',
    'Select View': 'Ansicht auswählen',
};

const calendarDeDE = {
    Today: 'Heute',
    Month: 'Monat',
    Week: 'Woche',
    Day: 'Tag',
    events: 'Ereignisse',
    event: 'Ereignis',
    'No events': 'Keine Ereignisse',
    'Next period': 'Nächster Zeitraum',
    'Previous period': 'Vorheriger Zeitraum',
    to: 'bis', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Ganztägige und mehrtägige Ereignisse',
};

const deDE = {
    ...datePickerDeDE,
    ...calendarDeDE,
};

const datePickerEnUS = {
    Date: 'Date',
    'MM/DD/YYYY': 'MM/DD/YYYY',
    'Next month': 'Next month',
    'Previous month': 'Previous month',
    'Choose Date': 'Choose Date',
    'Select View': 'Select View',
};

const calendarEnUS = {
    Today: 'Today',
    Month: 'Month',
    Week: 'Week',
    Day: 'Day',
    events: 'events',
    event: 'event',
    'No events': 'No events',
    'Next period': 'Next period',
    'Previous period': 'Previous period',
    to: 'to', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Full day- and multiple day events',
};

const enUS = {
    ...datePickerEnUS,
    ...calendarEnUS,
};

const datePickerItIT = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Mese successivo',
    'Previous month': 'Mese precedente',
    'Choose Date': 'Scegli la data',
    'Select View': 'Seleziona la vista',
};

const calendarItIT = {
    Today: 'Oggi',
    Month: 'Mese',
    Week: 'Settimana',
    Day: 'Giorno',
    events: 'eventi',
    event: 'evento',
    'No events': 'Nessun evento',
    'Next period': 'Periodo successivo',
    'Previous period': 'Periodo precedente',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Eventi della giornata e plurigiornalieri',
};

const itIT = {
    ...datePickerItIT,
    ...calendarItIT,
};

const datePickerEnGB = {
    Date: 'Date',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Next month',
    'Previous month': 'Previous month',
    'Choose Date': 'Choose Date',
    'Select View': 'Select View',
};

const calendarEnGB = {
    Today: 'Today',
    Month: 'Month',
    Week: 'Week',
    Day: 'Day',
    events: 'events',
    event: 'event',
    'No events': 'No events',
    'Next period': 'Next period',
    'Previous period': 'Previous period',
    to: 'to', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Full day- and multiple day events',
};

const enGB = {
    ...datePickerEnGB,
    ...calendarEnGB,
};

const datePickerSvSE = {
    Date: 'Datum',
    'MM/DD/YYYY': 'ÅÅÅÅ-MM-DD',
    'Next month': 'Nästa månad',
    'Previous month': 'Föregående månad',
    'Choose Date': 'Välj datum',
    'Select View': 'Välj vy',
};

const calendarSvSE = {
    Today: 'Idag',
    Month: 'Månad',
    Week: 'Vecka',
    Day: 'Dag',
    events: 'händelser',
    event: 'händelse',
    'No events': 'Inga händelser',
    'Next period': 'Nästa period',
    'Previous period': 'Föregående period',
    to: 'till', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Heldags- och flerdagshändelser',
};

const svSE = {
    ...datePickerSvSE,
    ...calendarSvSE,
};

const datePickerZhCN = {
    Date: '日期',
    'MM/DD/YYYY': '年/月/日',
    'Next month': '下个月',
    'Previous month': '上个月',
    'Choose Date': '选择日期',
    'Select View': '选择视图',
};

const calendarZhCN = {
    Today: '今天',
    Month: '月',
    Week: '周',
    Day: '日',
    events: '场活动',
    event: '活动',
    'No events': '没有活动',
    'Next period': '下一段时间',
    'Previous period': '上一段时间',
    to: '至', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '全天和多天活动',
};

const zhCN = {
    ...datePickerZhCN,
    ...calendarZhCN,
};

const datePickerJaJP = {
    Date: '日付',
    'MM/DD/YYYY': '年/月/日',
    'Next month': '次の月',
    'Previous month': '前の月',
    'Choose Date': '日付を選択',
    'Select View': 'ビューを選択',
};

const calendarJaJP = {
    Today: '今日',
    Month: '月',
    Week: '週',
    Day: '日',
    events: 'イベント',
    event: 'イベント',
    'No events': 'イベントなし',
    'Next period': '次の期間',
    'Previous period': '前の期間',
    to: 'から', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '終日および複数日イベント',
};

const jaJP = {
    ...datePickerJaJP,
    ...calendarJaJP,
};

const datePickerRuRU = {
    Date: 'Дата',
    'MM/DD/YYYY': 'ММ/ДД/ГГГГ',
    'Next month': 'Следующий месяц',
    'Previous month': 'Прошлый месяц',
    'Choose Date': 'Выберите дату',
    'Select View': 'Выберите вид',
};

const calendarRuRU = {
    Today: 'Сегодня',
    Month: 'Месяц',
    Week: 'Неделя',
    Day: 'День',
    events: 'события',
    event: 'событие',
    'No events': 'Нет событий',
    'Next period': 'Следующий период',
    'Previous period': 'Прошлый период',
    to: 'по', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'События на целый день и несколько дней подряд',
};

const ruRU = {
    ...datePickerRuRU,
    ...calendarRuRU,
};

const datePickerKoKR = {
    Date: '일자',
    'MM/DD/YYYY': '년/월/일',
    'Next month': '다음 달',
    'Previous month': '이전 달',
    'Choose Date': '날짜 선택',
    'Select View': '보기 선택',
};

const calendarKoKR = {
    Today: '오늘',
    Month: '월',
    Week: '주',
    Day: '일',
    events: '일정들',
    event: '일정',
    'No events': '일정 없음',
    'Next period': '다음',
    'Previous period': '이전',
    to: '부터', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': '종일 및 복수일 일정',
};

const koKR = {
    ...datePickerKoKR,
    ...calendarKoKR,
};

const datePickerFrFR = {
    Date: 'Date',
    'MM/DD/YYYY': 'JJ/MM/AAAA',
    'Next month': 'Mois suivant',
    'Previous month': 'Mois précédent',
    'Choose Date': 'Choisir une date',
    'Select View': 'Choisir la vue',
};

const calendarFrFR = {
    Today: "Aujourd'hui",
    Month: 'Mois',
    Week: 'Semaine',
    Day: 'Jour',
    events: 'événements',
    event: 'événement',
    'No events': 'Aucun événement',
    'Next period': 'Période suivante',
    'Previous period': 'Période précédente',
    to: 'à', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': "Événements d'une ou plusieurs journées",
};

const frFR = {
    ...datePickerFrFR,
    ...calendarFrFR,
};

const datePickerDaDK = {
    Date: 'Dato',
    'MM/DD/YYYY': 'ÅÅÅÅ-MM-DD',
    'Next month': 'Næste måned',
    'Previous month': 'Foregående måned',
    'Choose Date': 'Vælg dato',
    'Select View': 'Vælg visning',
};

const calendarDaDK = {
    Today: 'I dag',
    Month: 'Måned',
    Week: 'Uge',
    Day: 'Dag',
    events: 'begivenheder',
    event: 'begivenhed',
    'No events': 'Ingen begivenheder',
    'Next period': 'Næste periode',
    'Previous period': 'Forgående periode',
    to: 'til', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Heldagsbegivenheder og flerdagsbegivenheder',
};

const daDK = {
    ...datePickerDaDK,
    ...calendarDaDK,
};

const datePickerPlPL = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Następny miesiąc',
    'Previous month': 'Poprzedni miesiąc',
    'Choose Date': 'Wybiewrz datę',
    'Select View': 'Wybierz widok',
};

const calendarPlPL = {
    Today: 'Dzisiaj',
    Month: 'Miesiąc',
    Week: 'Tydzień',
    Day: 'Dzień',
    events: 'wydarzenia',
    event: 'wydarzenie',
    'No events': 'Brak wydarzeń',
    'Next period': 'Następny okres',
    'Previous period': 'Poprzedni okres',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Wydarzenia całodniowe i wielodniowe',
};

const plPL = {
    ...datePickerPlPL,
    ...calendarPlPL,
};

const datePickerEsES = {
    Date: 'Fecha',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Siguiente mes',
    'Previous month': 'Mes anterior',
    'Choose Date': 'Seleccione una fecha',
    'Select View': 'Seleccione una vista',
};

const calendarEsES = {
    Today: 'Hoy',
    Month: 'Mes',
    Week: 'Semana',
    Day: 'Día',
    events: 'eventos',
    event: 'evento',
    'No events': 'Sin eventos',
    'Next period': 'Siguiente período',
    'Previous period': 'Período anterior',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Día completo y eventos de múltiples días',
};

const esES = {
    ...datePickerEsES,
    ...calendarEsES,
};

const calendarNlNL = {
    Today: 'Vandaag',
    Month: 'Maand',
    Week: 'Week',
    Day: 'Dag',
    events: 'gebeurtenissen',
    event: 'gebeurtenis',
    'No events': 'Geen gebeurtenissen',
    'Next period': 'Volgende periode',
    'Previous period': 'Vorige periode',
    to: 'tot', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Evenementen van een hele dag en meerdere dagen',
};

const datePickerNlNL = {
    Date: 'Datum',
    'MM/DD/YYYY': 'DD-MM-JJJJ',
    'Next month': 'Vorige maand',
    'Previous month': 'Volgende maand',
    'Choose Date': 'Datum kiezen',
    'Select View': 'Weergave kiezen',
};

const nlNL = {
    ...datePickerNlNL,
    ...calendarNlNL,
};

const datePickerPtBR = {
    Date: 'Data',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Mês seguinte',
    'Previous month': 'Mês anterior',
    'Choose Date': 'Escolha uma data',
    'Select View': 'Selecione uma visualização',
};

const calendarPtBR = {
    Today: 'Hoje',
    Month: 'Mês',
    Week: 'Semana',
    Day: 'Dia',
    events: 'eventos',
    event: 'evento',
    'No events': 'Sem eventos',
    'Next period': 'Período seguinte',
    'Previous period': 'Período anterior',
    to: 'a', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Dia inteiro e eventos de vários dias',
};

const ptBR = {
    ...datePickerPtBR,
    ...calendarPtBR,
};

const datePickerSkSK = {
    Date: 'Dátum',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Ďalší mesiac',
    'Previous month': 'Predchádzajúci mesiac',
    'Choose Date': 'Vyberte dátum',
    'Select View': 'Vyberte zobrazenie',
};

const calendarSkSK = {
    Today: 'Dnes',
    Month: 'Mesiac',
    Week: 'Týždeň',
    Day: 'Deň',
    events: 'udalosti',
    event: 'udalosť',
    'No events': 'Žiadne udalosti',
    'Next period': 'Ďalšie obdobie',
    'Previous period': 'Predchádzajúce obdobie',
    to: 'do', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Celodenné a viacdňové udalosti',
};

const skSK = {
    ...datePickerSkSK,
    ...calendarSkSK,
};

const datePickerMkMK = {
    Date: 'Датум',
    'MM/DD/YYYY': 'DD/MM/YYYY',
    'Next month': 'Следен месец',
    'Previous month': 'Претходен месец',
    'Choose Date': 'Избери Датум',
    'Select View': 'Избери Преглед',
};

const calendarMkMK = {
    Today: 'Денес',
    Month: 'Месец',
    Week: 'Недела',
    Day: 'Ден',
    events: 'настани',
    event: 'настан',
    'No events': 'Нема настани',
    'Next period': 'Следен период',
    'Previous period': 'Претходен период',
    to: 'до', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Целодневни и повеќедневни настани',
};

const mkMK = {
    ...datePickerMkMK,
    ...calendarMkMK,
};

const datePickerTrTR = {
    Date: 'Tarih',
    'MM/DD/YYYY': 'GG/AA/YYYY',
    'Next month': 'Sonraki ay',
    'Previous month': 'Önceki ay',
    'Choose Date': 'Tarih Seç',
    'Select View': 'Görünüm Seç',
};

const calendarTrTR = {
    Today: 'Bugün',
    Month: 'Aylık',
    Week: 'Haftalık',
    Day: 'Günlük',
    events: 'etkinlikler',
    event: 'etkinlik',
    'No events': 'Etkinlik yok',
    'Next period': 'Sonraki dönem',
    'Previous period': 'Önceki dönem',
    to: 'dan', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Tüm gün ve çoklu gün etkinlikleri',
};

const trTR = {
    ...datePickerTrTR,
    ...calendarTrTR,
};

const datePickerKyKG = {
    Date: 'Датасы',
    'MM/DD/YYYY': 'АА/КК/ЖЖЖЖ',
    'Next month': 'Кийинки ай',
    'Previous month': 'Өткөн ай',
    'Choose Date': 'Күндү тандаңыз',
    'Select View': 'Көрүнүштү тандаңыз',
};

const calendarKyKG = {
    Today: 'Бүгүн',
    Month: 'Ай',
    Week: 'Апта',
    Day: 'Күн',
    events: 'Окуялар',
    event: 'Окуя',
    'No events': 'Окуя жок',
    'Next period': 'Кийинки мезгил',
    'Previous period': 'Өткөн мезгил',
    to: 'чейин', // as in 2/1/2020 to 2/2/2020
    'Full day- and multiple day events': 'Күн бою жана бир нече күн катары менен болгон окуялар',
};

const kyKG = {
    ...datePickerKyKG,
    ...calendarKyKG,
};

class InvalidLocaleError extends Error {
    constructor(locale) {
        super(`Invalid locale: ${locale}`);
    }
}

const translate = (locale, languages) => (key) => {
    if (!/^[a-z]{2}-[A-Z]{2}$/.test(locale))
        throw new InvalidLocaleError(locale);
    const deHyphenatedLocale = locale.replace('-', '');
    const language = languages[deHyphenatedLocale];
    if (!language)
        return key;
    return language[key] || key;
};

const translations = {
    deDE,
    enUS,
    itIT,
    enGB,
    svSE,
    zhCN,
    jaJP,
    ruRU,
    koKR,
    frFR,
    daDK,
    mkMK,
    plPL,
    esES,
    nlNL,
    ptBR,
    skSK,
    trTR,
    kyKG,
};

class EventColors {
    constructor(config) {
        Object.defineProperty(this, "config", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: config
        });
    }
    setLight() {
        Object.entries(this.config.calendars.value || {}).forEach(([calendarName, calendar]) => {
            if (!calendar.lightColors) {
                console.warn(`No light colors defined for calendar ${calendarName}`);
                return;
            }
            this.setColors(calendar.colorName, calendar.lightColors);
        });
    }
    setDark() {
        Object.entries(this.config.calendars.value || {}).forEach(([calendarName, calendar]) => {
            if (!calendar.darkColors) {
                console.warn(`No dark colors defined for calendar ${calendarName}`);
                return;
            }
            this.setColors(calendar.colorName, calendar.darkColors);
        });
    }
    setColors(colorName, colorDefinition) {
        document.documentElement.style.setProperty(`--sx-color-${colorName}`, colorDefinition.main);
        document.documentElement.style.setProperty(`--sx-color-${colorName}-container`, colorDefinition.container);
        document.documentElement.style.setProperty(`--sx-color-on-${colorName}-container`, colorDefinition.onContainer);
    }
}

const createCalendarState = (calendarConfig, timeUnitsImpl, selectedDate) => {
    var _a;
    const view = signal(((_a = calendarConfig.views.find((view) => view.name === calendarConfig.defaultView)) === null || _a === void 0 ? void 0 : _a.name) || calendarConfig.views[0].name);
    const range = signal(null);
    let wasInitialized = false;
    const callOnRangeUpdate = (_range) => {
        if (!wasInitialized)
            return (wasInitialized = true);
        if (calendarConfig.callbacks.onRangeUpdate && _range.value) {
            calendarConfig.callbacks.onRangeUpdate(_range.value);
        }
    };
    effect(() => {
        if (calendarConfig.callbacks.onRangeUpdate && range.value) {
            callOnRangeUpdate(range);
        }
    });
    const setRange = (date) => {
        var _a, _b;
        const selectedView = calendarConfig.views.find((availableView) => availableView.name === view.value);
        const newRange = selectedView.setDateRange({
            calendarConfig,
            date,
            range,
            timeUnitsImpl,
        });
        if (newRange.start === ((_a = range.value) === null || _a === void 0 ? void 0 : _a.start) &&
            newRange.end === ((_b = range.value) === null || _b === void 0 ? void 0 : _b.end))
            return;
        range.value = newRange;
    };
    // one initial call for setting the range
    setRange(selectedDate || toDateString$1(new Date()));
    const isCalendarSmall = signal(undefined);
    const isDark = signal(calendarConfig.isDark || false);
    effect(() => {
        const eventColors = new EventColors(calendarConfig);
        if (isDark.value) {
            eventColors.setDark();
        }
        else {
            eventColors.setLight();
        }
    });
    return {
        isDark,
        view,
        setRange,
        range,
        isCalendarSmall,
    };
};

const createCalendarEventsImpl = (events, config) => {
    const list = signal(events.map((event) => {
        return externalEventToInternal(event, config);
    }));
    return {
        list,
    };
};

InternalViewName.Week;
const DEFAULT_DAY_BOUNDARIES = {
    start: 0,
    end: 2400,
};
const DEFAULT_WEEK_GRID_HEIGHT = 1600;
const DATE_GRID_BLOCKER = 'blocker';

const timePointsPerDay = (dayStart, dayEnd, isHybridDay) => {
    if (dayStart === dayEnd)
        return 2400;
    if (isHybridDay)
        return 2400 - dayStart + dayEnd;
    return dayEnd - dayStart;
};

class CalendarConfigImpl {
    constructor(locale = DEFAULT_LOCALE, firstDayOfWeek = DEFAULT_FIRST_DAY_OF_WEEK, defaultView = InternalViewName.Week, views = [], dayBoundaries = DEFAULT_DAY_BOUNDARIES, weekOptions = {
        gridHeight: DEFAULT_WEEK_GRID_HEIGHT,
    }, calendars = {}, plugins = {}, isDark = false, callbacks = {}, _customComponentFns = {}, minDate = undefined, maxDate = undefined, monthGridOptions = {
        nEventsPerDay: 4,
    }, customMenus = undefined) {
        Object.defineProperty(this, "locale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: locale
        });
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: firstDayOfWeek
        });
        Object.defineProperty(this, "defaultView", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: defaultView
        });
        Object.defineProperty(this, "views", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: views
        });
        Object.defineProperty(this, "dayBoundaries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: dayBoundaries
        });
        Object.defineProperty(this, "weekOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: weekOptions
        });
        Object.defineProperty(this, "plugins", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: plugins
        });
        Object.defineProperty(this, "isDark", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: isDark
        });
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: callbacks
        });
        Object.defineProperty(this, "_customComponentFns", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: _customComponentFns
        });
        Object.defineProperty(this, "minDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: minDate
        });
        Object.defineProperty(this, "maxDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: maxDate
        });
        Object.defineProperty(this, "monthGridOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: monthGridOptions
        });
        Object.defineProperty(this, "customMenus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: customMenus
        });
        Object.defineProperty(this, "calendars", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.calendars = signal(calendars);
    }
    get isHybridDay() {
        return (this.dayBoundaries.start > this.dayBoundaries.end ||
            (this.dayBoundaries.start !== 0 &&
                this.dayBoundaries.start === this.dayBoundaries.end));
    }
    get timePointsPerDay() {
        return timePointsPerDay(this.dayBoundaries.start, this.dayBoundaries.end, this.isHybridDay);
    }
}

class CalendarConfigBuilder {
    constructor() {
        Object.defineProperty(this, "locale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "defaultView", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "views", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "dayBoundaries", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "weekOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "monthGridOptions", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "calendars", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "plugins", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: {}
        });
        Object.defineProperty(this, "isDark", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: false
        });
        Object.defineProperty(this, "callbacks", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "minDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "maxDate", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "customMenus", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new CalendarConfigImpl(this.locale, this.firstDayOfWeek, this.defaultView, this.views, this.dayBoundaries, this.weekOptions, this.calendars, this.plugins, this.isDark, this.callbacks, {}, this.minDate, this.maxDate, this.monthGridOptions, this.customMenus);
    }
    withCustomMenus(menus) {
        this.customMenus = menus;
        return this;
    }
    withLocale(locale) {
        this.locale = locale;
        return this;
    }
    withFirstDayOfWeek(firstDayOfWeek) {
        this.firstDayOfWeek = firstDayOfWeek;
        return this;
    }
    withDefaultView(defaultView) {
        this.defaultView = defaultView;
        return this;
    }
    withViews(views) {
        this.views = views;
        return this;
    }
    withDayBoundaries(dayBoundaries) {
        if (!dayBoundaries)
            return this;
        this.dayBoundaries = {
            start: timePointsFromString(dayBoundaries.start),
            end: timePointsFromString(dayBoundaries.end),
        };
        return this;
    }
    withWeekOptions(weekOptions) {
        this.weekOptions = weekOptions;
        return this;
    }
    withCalendars(calendars) {
        this.calendars = calendars;
        return this;
    }
    withPlugins(plugins) {
        if (!plugins)
            return this;
        plugins.forEach((plugin) => {
            this.plugins[plugin.name] = plugin;
        });
        return this;
    }
    withIsDark(isDark) {
        this.isDark = isDark;
        return this;
    }
    withCallbacks(listeners) {
        this.callbacks = listeners;
        return this;
    }
    withMinDate(minDate) {
        this.minDate = minDate;
        return this;
    }
    withMaxDate(maxDate) {
        this.maxDate = maxDate;
        return this;
    }
    withMonthGridOptions(monthOptions) {
        this.monthGridOptions = monthOptions;
        return this;
    }
}

const createInternalConfig = (config) => {
    return new CalendarConfigBuilder()
        .withLocale(config.locale)
        .withFirstDayOfWeek(config.firstDayOfWeek)
        .withDefaultView(config.defaultView)
        .withViews(config.views)
        .withDayBoundaries(config.dayBoundaries)
        .withWeekOptions(config.weekOptions)
        .withCalendars(config.calendars)
        .withPlugins(config.plugins)
        .withIsDark(config.isDark)
        .withCallbacks(config.callbacks)
        .withMinDate(config.minDate)
        .withMaxDate(config.maxDate)
        .withMonthGridOptions(config.monthGridOptions)
        .withCustomMenus(config.customMenus)
        .build();
};

var Month;
(function (Month) {
    Month[Month["JANUARY"] = 0] = "JANUARY";
    Month[Month["FEBRUARY"] = 1] = "FEBRUARY";
    Month[Month["MARCH"] = 2] = "MARCH";
    Month[Month["APRIL"] = 3] = "APRIL";
    Month[Month["MAY"] = 4] = "MAY";
    Month[Month["JUNE"] = 5] = "JUNE";
    Month[Month["JULY"] = 6] = "JULY";
    Month[Month["AUGUST"] = 7] = "AUGUST";
    Month[Month["SEPTEMBER"] = 8] = "SEPTEMBER";
    Month[Month["OCTOBER"] = 9] = "OCTOBER";
    Month[Month["NOVEMBER"] = 10] = "NOVEMBER";
    Month[Month["DECEMBER"] = 11] = "DECEMBER";
})(Month || (Month = {}));

class NoYearZeroError extends Error {
    constructor() {
        super('Year zero does not exist in the Gregorian calendar.');
    }
}

class ExtendedDateImpl extends Date {
    constructor(yearArg, monthArg, dateArg) {
        super(yearArg, monthArg, dateArg);
        if (yearArg === 0)
            throw new NoYearZeroError();
        this.setFullYear(yearArg); // Overwrite the behavior of JS-Date, whose constructor does not allow years 0-99
    }
    get year() {
        return this.getFullYear();
    }
    get month() {
        return this.getMonth();
    }
    get date() {
        return this.getDate();
    }
}

class TimeUnitsImpl {
    constructor(firstDayOfWeek = DEFAULT_FIRST_DAY_OF_WEEK) {
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: firstDayOfWeek
        });
    }
    getMonthWithTrailingAndLeadingDays(year, month) {
        if (year === 0)
            throw new NoYearZeroError();
        const firstDateOfMonth = new Date(year, month, 1);
        const monthWithDates = [this.getWeekFor(firstDateOfMonth)];
        let isInMonth = true;
        let first = monthWithDates[0][0]; // first day of first week of month
        while (isInMonth) {
            const newFirstDayOfWeek = new Date(first.getFullYear(), first.getMonth(), first.getDate() + 7);
            if (newFirstDayOfWeek.getMonth() === month) {
                monthWithDates.push(this.getWeekFor(newFirstDayOfWeek));
                first = newFirstDayOfWeek;
            }
            else {
                isInMonth = false;
            }
        }
        return monthWithDates;
    }
    getWeekFor(date) {
        const week = [this.getFirstDateOfWeek(date)];
        while (week.length < 7) {
            const lastDateOfWeek = week[week.length - 1];
            const nextDateOfWeek = new Date(lastDateOfWeek);
            nextDateOfWeek.setDate(lastDateOfWeek.getDate() + 1);
            week.push(nextDateOfWeek);
        }
        return week;
    }
    getMonthsFor(year) {
        return Object.values(Month)
            .filter((month) => !isNaN(Number(month)))
            .map((month) => new ExtendedDateImpl(year, Number(month), 1));
    }
    getFirstDateOfWeek(date) {
        const dateIsNthDayOfWeek = date.getDay() - this.firstDayOfWeek;
        const firstDateOfWeek = date;
        if (dateIsNthDayOfWeek === 0) {
            return firstDateOfWeek;
        }
        else if (dateIsNthDayOfWeek > 0) {
            firstDateOfWeek.setDate(date.getDate() - dateIsNthDayOfWeek);
        }
        else {
            firstDateOfWeek.setDate(date.getDate() - (7 + dateIsNthDayOfWeek));
        }
        return firstDateOfWeek;
    }
}

class TimeUnitsBuilder {
    constructor() {
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new TimeUnitsImpl(this.firstDayOfWeek);
    }
    withFirstDayOfWeek(firstDayOfWeek) {
        this.firstDayOfWeek = firstDayOfWeek;
        return this;
    }
}

const createTimeUnitsImpl = (internalConfig) => {
    return new TimeUnitsBuilder()
        .withFirstDayOfWeek(internalConfig.firstDayOfWeek)
        .build();
};

var Placement;
(function (Placement) {
    Placement["TOP_START"] = "top-start";
    Placement["TOP_END"] = "top-end";
    Placement["BOTTOM_START"] = "bottom-start";
    Placement["BOTTOM_END"] = "bottom-end";
})(Placement || (Placement = {}));

class ConfigImpl {
    constructor(locale = DEFAULT_LOCALE, firstDayOfWeek = DEFAULT_FIRST_DAY_OF_WEEK, min = toDateString$1(new Date(1970, 0, 1)), max = toDateString$1(new Date(new Date().getFullYear() + 1, 11, 31)), placement = Placement.BOTTOM_START, listeners = {}, style = {}, teleportTo, label) {
        Object.defineProperty(this, "locale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: locale
        });
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: firstDayOfWeek
        });
        Object.defineProperty(this, "min", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: min
        });
        Object.defineProperty(this, "max", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: max
        });
        Object.defineProperty(this, "placement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: placement
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: listeners
        });
        Object.defineProperty(this, "style", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: style
        });
        Object.defineProperty(this, "teleportTo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: teleportTo
        });
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: label
        });
    }
}

class ConfigBuilder {
    constructor() {
        Object.defineProperty(this, "locale", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "firstDayOfWeek", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "min", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "max", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "placement", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "listeners", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "style", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "teleportTo", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
    }
    build() {
        return new ConfigImpl(this.locale, this.firstDayOfWeek, this.min, this.max, this.placement, this.listeners, this.style, this.teleportTo, this.label);
    }
    withLocale(locale) {
        this.locale = locale;
        return this;
    }
    withFirstDayOfWeek(firstDayOfWeek) {
        this.firstDayOfWeek = firstDayOfWeek;
        return this;
    }
    withMin(min) {
        this.min = min;
        return this;
    }
    withMax(max) {
        this.max = max;
        return this;
    }
    withPlacement(placement) {
        this.placement = placement;
        return this;
    }
    withListeners(listeners) {
        this.listeners = listeners;
        return this;
    }
    withStyle(style) {
        this.style = style;
        return this;
    }
    withTeleportTo(teleportTo) {
        this.teleportTo = teleportTo;
        return this;
    }
    withLabel(label) {
        this.label = label;
        return this;
    }
}

const createDatePickerConfig = (config, dateSelectionCallback) => {
    var _a;
    return new ConfigBuilder()
        .withLocale(config.locale)
        .withFirstDayOfWeek(config.firstDayOfWeek)
        .withMin(config.minDate)
        .withMax(config.maxDate)
        .withStyle((_a = config.datePicker) === null || _a === void 0 ? void 0 : _a.style)
        .withPlacement(Placement.BOTTOM_END)
        .withListeners({ onChange: dateSelectionCallback })
        .build();
};

const createDateSelectionCallback = (calendarState, config) => {
    let lastEmittedDate = null;
    return (date) => {
        var _a;
        calendarState.setRange(date);
        if (((_a = config.callbacks) === null || _a === void 0 ? void 0 : _a.onSelectedDateUpdate) && date !== lastEmittedDate) {
            lastEmittedDate = date;
            config.callbacks.onSelectedDateUpdate(date);
        }
    };
};

const createCalendarAppSingleton = (config) => {
    var _a;
    const internalConfig = createInternalConfig(config);
    const timeUnitsImpl = createTimeUnitsImpl(internalConfig);
    const calendarState = createCalendarState(internalConfig, timeUnitsImpl, config.selectedDate);
    const dateSelectionCallback = createDateSelectionCallback(calendarState, config);
    const datePickerConfig = createDatePickerConfig(config, dateSelectionCallback);
    const datePickerState = createDatePickerState(datePickerConfig, config.selectedDate || ((_a = config.datePicker) === null || _a === void 0 ? void 0 : _a.selectedDate));
    const calendarEvents = createCalendarEventsImpl(config.events || [], internalConfig);
    return new CalendarAppSingletonBuilder()
        .withConfig(internalConfig)
        .withTimeUnitsImpl(timeUnitsImpl)
        .withDatePickerState(datePickerState)
        .withCalendarEvents(calendarEvents)
        .withDatePickerConfig(datePickerConfig)
        .withCalendarState(calendarState)
        .withTranslate(translate(internalConfig.locale, translations))
        .build();
};
const createCalendar = (config) => {
    return new CalendarApp(createCalendarAppSingleton(config));
};

class PreactView {
    constructor(config) {
        Object.defineProperty(this, "randomId", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: randomStringId()
        });
        Object.defineProperty(this, "name", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "label", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "Component", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "setDateRange", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hasSmallScreenCompat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "hasWideScreenCompat", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "backwardForwardFn", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        Object.defineProperty(this, "backwardForwardUnits", {
            enumerable: true,
            configurable: true,
            writable: true,
            value: void 0
        });
        this.name = config.name;
        this.label = config.label;
        this.Component = config.Component;
        this.setDateRange = config.setDateRange;
        this.hasSmallScreenCompat = config.hasSmallScreenCompat;
        this.hasWideScreenCompat = config.hasWideScreenCompat;
        this.backwardForwardFn = config.backwardForwardFn;
        this.backwardForwardUnits = config.backwardForwardUnits;
    }
    render(onElement, $app) {
        render(createElement(this.Component, { $app, id: this.randomId }), onElement);
    }
    destroy() {
        const el = document.getElementById(this.randomId);
        if (el) {
            el.remove();
        }
    }
}
const createPreactView = (config) => {
    return new PreactView(config);
};

const timePointToPercentage = (timePointsInDay, dayBoundaries, timePoint) => {
    if (timePoint < dayBoundaries.start) {
        const firstDayTimePoints = 2400 - dayBoundaries.start;
        return ((timePoint + firstDayTimePoints) / timePointsInDay) * 100;
    }
    return ((timePoint - dayBoundaries.start) / timePointsInDay) * 100;
};

const getEventHeight = (start, end, dayBoundaries, pointsPerDay) => {
    return (timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(end))) -
        timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(start))));
};
const getLeftRule = (calendarEvent) => {
    if (!calendarEvent._totalConcurrentEvents ||
        !calendarEvent._previousConcurrentEvents)
        return 0;
    return (((calendarEvent._previousConcurrentEvents || 0) /
        (calendarEvent._totalConcurrentEvents || 0)) *
        100);
};
const getWidthRule = (leftRule) => {
    return 100 - leftRule;
};
const getBorderRule = (calendarEvent) => {
    if (!calendarEvent._previousConcurrentEvents)
        return 0;
    return '1px solid #fff';
};

const getTimeGridEventCopyElementId = (id) => {
    return 'time-grid-event-copy-' + id;
};

const isUIEventTouchEvent = (event) => {
    return 'touches' in event && typeof event.touches === 'object';
};

function useEventInteractions($app) {
    const [eventCopy, setEventCopy] = useState();
    const updateCopy = (newCopy) => {
        if (!newCopy)
            return setEventCopy(undefined);
        setEventCopy(deepCloneEvent(newCopy, $app));
    };
    const [dragStartTimeout, setDragStartTimeout] = useState();
    const createDragStartTimeout = (callback, uiEvent) => {
        setDragStartTimeout(setTimeout(() => callback(uiEvent), 150));
    };
    const setClickedEvent = (uiEvent, calendarEvent) => {
        // For some reason, an event without touches is being triggered on touchend
        if (isUIEventTouchEvent(uiEvent) &&
            uiEvent.touches.length === 0)
            return;
        if (!$app.config.plugins.eventModal)
            return;
        const eventTarget = uiEvent.target;
        if (!(eventTarget instanceof HTMLElement))
            return;
        const calendarEventElement = eventTarget.classList.contains('sx__event')
            ? eventTarget
            : eventTarget.closest('.sx__event');
        if (calendarEventElement instanceof HTMLElement) {
            $app.config.plugins.eventModal.calendarEventElement.value =
                calendarEventElement;
            $app.config.plugins.eventModal.setCalendarEvent(calendarEvent, calendarEventElement.getBoundingClientRect());
        }
    };
    const setClickedEventIfNotDragging = (calendarEvent, uiEvent) => {
        if (dragStartTimeout) {
            clearTimeout(dragStartTimeout);
            setClickedEvent(uiEvent, calendarEvent);
        }
        setDragStartTimeout(undefined);
    };
    return {
        eventCopy,
        updateCopy,
        createDragStartTimeout,
        setClickedEventIfNotDragging,
        setClickedEvent,
    };
}

const getCCID = (customComponent, isCopy) => {
    let customComponentId = customComponent
        ? 'custom-time-grid-event-' + randomStringId() // needs a unique string to support event recurrence
        : undefined;
    if (customComponentId && isCopy)
        customComponentId += '-' + 'copy';
    return customComponentId;
};

/**
 * Get an element in the DOM by their custom component id
 * */
const getElementByCCID = (customComponentId) => document.querySelector(`[data-ccid="${customComponentId}"]`);

const invokeOnEventClickCallback = ($app, calendarEvent) => {
    if ($app.config.callbacks.onEventClick) {
        $app.config.callbacks.onEventClick(calendarEvent._getExternalEvent());
    }
};

const getEventCoordinates = (uiEvent) => {
    const actualEvent = isUIEventTouchEvent(uiEvent)
        ? uiEvent.touches[0]
        : uiEvent;
    return {
        clientX: actualEvent.clientX,
        clientY: actualEvent.clientY,
    };
};

const getYCoordinateInTimeGrid = (dateTimeString, dayBoundaries, pointsPerDay) => {
    return timePointToPercentage(pointsPerDay, dayBoundaries, timePointsFromString(timeFromDateTime(dateTimeString)));
};

function TimeGridEvent({ calendarEvent, dayBoundariesDateTime, isCopy, }) {
    const $app = useContext(AppContext);
    const { eventCopy, updateCopy, createDragStartTimeout, setClickedEventIfNotDragging, } = useEventInteractions($app);
    const localizeArgs = [
        $app.config.locale,
        { hour: 'numeric', minute: 'numeric' },
    ];
    const getEventTime = (start, end) => {
        const localizedStartTime = toJSDate(start).toLocaleTimeString(...localizeArgs);
        const localizedEndTime = toJSDate(end).toLocaleTimeString(...localizeArgs);
        return `${localizedStartTime} – ${localizedEndTime}`;
    };
    const eventCSSVariables = {
        borderLeft: `4px solid var(--sx-color-${calendarEvent._color})`,
        textColor: `var(--sx-color-on-${calendarEvent._color}-container)`,
        backgroundColor: `var(--sx-color-${calendarEvent._color}-container)`,
        iconStroke: `var(--sx-color-on-${calendarEvent._color}-container)`,
    };
    const leftRule = getLeftRule(calendarEvent);
    const handleStartDrag = (uiEvent) => {
        if (isUIEventTouchEvent(uiEvent))
            uiEvent.preventDefault();
        if (!dayBoundariesDateTime)
            return; // this can only happen in eventCopy
        if (!uiEvent.target)
            return;
        if (!$app.config.plugins.dragAndDrop)
            return;
        const newEventCopy = deepCloneEvent(calendarEvent, $app);
        updateCopy(newEventCopy);
        $app.config.plugins.dragAndDrop.createTimeGridDragHandler({
            $app,
            eventCoordinates: getEventCoordinates(uiEvent),
            updateCopy,
            eventCopy: newEventCopy,
        }, dayBoundariesDateTime);
    };
    const customComponent = $app.config._customComponentFns.timeGridEvent;
    const customComponentId = getCCID(customComponent, isCopy);
    useEffect(() => {
        if (!customComponent)
            return;
        customComponent(getElementByCCID(customComponentId), {
            calendarEvent: calendarEvent._getExternalEvent(),
        });
    }, []);
    const handleOnClick = (e) => {
        e.stopPropagation();
        invokeOnEventClickCallback($app, calendarEvent);
    };
    const startResize = (e) => {
        e.stopPropagation();
        if (!dayBoundariesDateTime)
            return; // this can only happen in eventCopy
        if ($app.config.plugins.resize) {
            const eventCopy = deepCloneEvent(calendarEvent, $app);
            updateCopy(eventCopy);
            $app.config.plugins.resize.createTimeGridEventResizer(eventCopy, updateCopy, e, dayBoundariesDateTime);
        }
    };
    return (u(Fragment, { children: [u("div", { id: isCopy ? getTimeGridEventCopyElementId(calendarEvent.id) : undefined, "data-event-id": calendarEvent.id, onClick: handleOnClick, onMouseDown: (e) => createDragStartTimeout(handleStartDrag, e), onMouseUp: (e) => setClickedEventIfNotDragging(calendarEvent, e), onTouchStart: (e) => createDragStartTimeout(handleStartDrag, e), onTouchEnd: (e) => setClickedEventIfNotDragging(calendarEvent, e), className: 'sx__time-grid-event sx__event' + (isCopy ? ' is-event-copy' : ''), tabIndex: 0, style: {
                    top: `${getYCoordinateInTimeGrid(calendarEvent.start, $app.config.dayBoundaries, $app.config.timePointsPerDay)}%`,
                    height: `${getEventHeight(calendarEvent.start, calendarEvent.end, $app.config.dayBoundaries, $app.config.timePointsPerDay)}%`,
                    left: `${leftRule}%`,
                    width: `${getWidthRule(leftRule)}%`,
                    backgroundColor: customComponent
                        ? undefined
                        : eventCSSVariables.backgroundColor,
                    color: customComponent ? undefined : eventCSSVariables.textColor,
                    border: customComponent ? undefined : getBorderRule(calendarEvent),
                    borderLeft: customComponent
                        ? undefined
                        : eventCSSVariables.borderLeft,
                    padding: customComponent ? '0' : undefined,
                }, children: u("div", { "data-ccid": customComponentId, className: "sx__time-grid-event-inner", children: [!customComponent && (u(Fragment, { children: [calendarEvent.title && (u("div", { className: "sx__time-grid-event-title", children: calendarEvent.title })), u("div", { className: "sx__time-grid-event-time", children: [u(TimeIcon, { strokeColor: eventCSSVariables.iconStroke }), getEventTime(calendarEvent.start, calendarEvent.end)] }), calendarEvent.people && (u("div", { className: "sx__time-grid-event-people", children: [u(UserIcon, { strokeColor: eventCSSVariables.iconStroke }), concatenatePeople(calendarEvent.people)] }))] })), $app.config.plugins.resize && (u("div", { className: 'sx__time-grid-event-resize-handle', onMouseDown: startResize }))] }) }), eventCopy && u(TimeGridEvent, { calendarEvent: eventCopy, isCopy: true })] }));
}

const sortEventsByStartAndEnd = (a, b) => {
    if (a.start === b.start) {
        if (a.end < b.end)
            return 1;
        if (a.end > b.end)
            return -1;
        return 0;
    }
    if (a.start < b.start)
        return -1;
    if (a.start > b.start)
        return 1;
    return 0;
};

const handleEventConcurrency = (sortedEvents, concurrentEventsCache = [], currentIndex = 0) => {
    for (let i = currentIndex; i < sortedEvents.length; i++) {
        const event = sortedEvents[i];
        const nextEvent = sortedEvents[i + 1];
        if (concurrentEventsCache.length &&
            (!nextEvent ||
                concurrentEventsCache.every((e) => e.end < nextEvent.start))) {
            concurrentEventsCache.push(event);
            for (let ii = 0; ii < concurrentEventsCache.length; ii++) {
                const currentEvent = concurrentEventsCache[ii];
                const NpreviousConcurrentEvents = concurrentEventsCache.filter((cachedEvent, index) => {
                    if (cachedEvent === currentEvent || index > ii)
                        return false;
                    return (cachedEvent.start <= currentEvent.start &&
                        cachedEvent.end > currentEvent.start);
                }).length;
                const NupcomingConcurrentEvents = concurrentEventsCache.filter((cachedEvent, index) => {
                    if (cachedEvent === currentEvent || index < ii)
                        return false;
                    return (cachedEvent.start < currentEvent.end &&
                        cachedEvent.end >= currentEvent.start);
                }).length;
                currentEvent._totalConcurrentEvents =
                    NpreviousConcurrentEvents + NupcomingConcurrentEvents + 1;
                currentEvent._previousConcurrentEvents = NpreviousConcurrentEvents;
            }
            concurrentEventsCache = [];
            return handleEventConcurrency(sortedEvents, concurrentEventsCache, i + 1);
        }
        if ((nextEvent && event.end > nextEvent.start) ||
            concurrentEventsCache.some((e) => e.end > event.start)) {
            concurrentEventsCache.push(event);
            return handleEventConcurrency(sortedEvents, concurrentEventsCache, i + 1);
        }
    }
    return sortedEvents;
};

const getClickDateTime = (e, $app, dayStartDateTime) => {
    if (!(e.target instanceof HTMLElement))
        return;
    const DAY_GRID_CLASS_NAME = 'sx__time-grid-day';
    const dayGridElement = e.target.classList.contains(DAY_GRID_CLASS_NAME)
        ? e.target
        : e.target.closest('.' + DAY_GRID_CLASS_NAME);
    const clientY = e.clientY - dayGridElement.getBoundingClientRect().top;
    const clickPercentageOfDay = (clientY / dayGridElement.getBoundingClientRect().height) * 100;
    const clickTimePointsIntoDay = Math.round(($app.config.timePointsPerDay / 100) * clickPercentageOfDay);
    return addTimePointsToDateTime(dayStartDateTime, clickTimePointsIntoDay);
};

function TimeGridDay({ calendarEvents, date }) {
    const $app = useContext(AppContext);
    const timeStringFromDayBoundary = timeStringFromTimePoints($app.config.dayBoundaries.start);
    const timeStringFromDayBoundaryEnd = timeStringFromTimePoints($app.config.dayBoundaries.end);
    const dayStartDateTime = setTimeInDateTimeString(date, timeStringFromDayBoundary);
    const dayEndDateTime = $app.config.isHybridDay
        ? addDays(setTimeInDateTimeString(date, timeStringFromDayBoundaryEnd), 1)
        : setTimeInDateTimeString(date, timeStringFromDayBoundaryEnd);
    const dayBoundariesDateTime = {
        start: dayStartDateTime,
        end: dayEndDateTime,
    };
    const sortedEvents = calendarEvents.sort(sortEventsByStartAndEnd);
    const [eventsWithConcurrency, setEventsWithConcurrency] = useState([]);
    useEffect(() => {
        setEventsWithConcurrency(handleEventConcurrency(sortedEvents));
    }, [calendarEvents]);
    const handleOnClick = (e) => {
        if (!$app.config.callbacks.onClickDateTime)
            return;
        const clickDateTime = getClickDateTime(e, $app, dayStartDateTime);
        if (clickDateTime) {
            $app.config.callbacks.onClickDateTime(clickDateTime);
        }
    };
    return (u("div", { className: "sx__time-grid-day", "data-time-grid-date": date, onClick: handleOnClick, "aria-label": getLocalizedDate(date, $app.config.locale), children: eventsWithConcurrency.map((event) => (u(TimeGridEvent, { calendarEvent: event, dayBoundariesDateTime: dayBoundariesDateTime }, event.id))) }));
}

const getTimeAxisHours = ({ start, end }, isHybridDay) => {
    const hours = [];
    let hour = Math.floor(start / 100);
    if (isHybridDay) {
        while (hour < 24) {
            hours.push(hour);
            hour += 1;
        }
        hour = 0;
    }
    const lastHour = end === 0 ? 24 : Math.ceil(end / 100);
    while (hour < lastHour) {
        hours.push(hour);
        hour += 1;
    }
    return hours;
};

function TimeAxis() {
    const $app = useContext(AppContext);
    const [hours, setHours] = useState([]);
    useEffect(() => {
        setHours(getTimeAxisHours($app.config.dayBoundaries, $app.config.isHybridDay));
        const hoursPerDay = $app.config.timePointsPerDay / 100;
        const pixelsPerHour = $app.config.weekOptions.gridHeight / hoursPerDay;
        document.documentElement.style.setProperty('--sx-week-grid-hour-height', `${pixelsPerHour}px`);
    }, []);
    return (u(Fragment, { children: u("div", { className: "sx__week-grid__time-axis", children: hours.map((hour) => (u("div", { className: "sx__week-grid__hour", children: u("span", { className: "sx__week-grid__hour-text", children: new Date(0, 0, 0, hour).toLocaleTimeString($app.config.locale, {
                        hour: 'numeric',
                    }) }) }))) }) }));
}

function DateAxis({ week }) {
    const $app = useContext(AppContext);
    const getClassNames = (date) => {
        const classNames = ['sx__week-grid__date'];
        if (isToday(date)) {
            classNames.push('sx__week-grid__date--is-today');
        }
        return classNames.join(' ');
    };
    return (u(Fragment, { children: u("div", { className: "sx__week-grid__date-axis", children: week.map((date) => (u("div", { className: getClassNames(date), children: [u("div", { className: "sx__week-grid__day-name", children: getDayNameShort(date, $app.config.locale) }), u("div", { className: "sx__week-grid__date-number", children: date.getDate() })] }))) }) }));
}

const sortEventsForWeekView = (allCalendarEvents) => {
    const dateGridEvents = [];
    const timeGridEvents = [];
    for (const event of allCalendarEvents) {
        if (event._isSingleDayTimed || event._isSingleHybridDayTimed) {
            timeGridEvents.push(event);
            continue;
        }
        if (event._isSingleDayFullDay ||
            event._isMultiDayFullDay ||
            event._isMultiDayTimed) {
            dateGridEvents.push(event);
        }
    }
    return { timeGridEvents, dateGridEvents };
};

const createOneDay = (week, date) => {
    const dateString = toDateString$1(date);
    week[dateString] = {
        date: dateString,
        timeGridEvents: [],
        dateGridEvents: {},
    };
    return week;
};
const createWeek = ($app) => {
    if ($app.calendarState.view.value === InternalViewName.Day)
        return createOneDay({}, toJSDate($app.calendarState.range.value.start));
    // Week mode
    return $app.timeUnitsImpl
        .getWeekFor(toJSDate($app.calendarState.range.value.start))
        .reduce(createOneDay, {});
};

const resetEventConcurrencyProperties = (event) => {
    event._previousConcurrentEvents = undefined;
    event._totalConcurrentEvents = undefined;
};
const positionInTimeGrid = (timeGridEvents, week, $app) => {
    for (const event of timeGridEvents) {
        resetEventConcurrencyProperties(event);
        const range = $app.calendarState.range.value;
        if (event.start >= range.start && event.end <= range.end) {
            let date = dateFromDateTime(event.start);
            const timeFromStart = timeFromDateTime(event.start);
            if (timePointsFromString(timeFromStart) < $app.config.dayBoundaries.start) {
                date = addDays(date, -1);
            }
            week[date].timeGridEvents.push(event);
        }
    }
    return week;
};

/**
 * Create a table-like representation of the week, where each cell can hold a full-day event or multiple-day-timed event.
 * If an event lasts more than one day, it creates blockers in the grid for its subsequent days, so that events don't collide.
 * For example:
 *
 * |  Mo    | Tue    |   We   |  Thu   |  Fri   | Sat    | Sun    |
 * | e1     | blocker| blocker| blocker| blocker| blocker| blocker|
 * |        |  e2    | blocker|        |  e4    |        |        |
 * |        |        |  e3    |        |        |        |        |
 * */
const positionInDateGrid = (sortedDateGridEvents, week) => {
    const weekDates = Object.keys(week).sort();
    const firstDateOfWeek = weekDates[0];
    const lastDateOfWeek = weekDates[weekDates.length - 1];
    const occupiedLevels = new Set();
    for (const event of sortedDateGridEvents) {
        const eventOriginalStartDate = dateFromDateTime(event.start);
        const eventOriginalEndDate = dateFromDateTime(event.end);
        const isEventStartInWeek = !!week[eventOriginalStartDate];
        let isEventInWeek = isEventStartInWeek;
        if (!isEventStartInWeek &&
            eventOriginalStartDate < firstDateOfWeek &&
            eventOriginalEndDate >= firstDateOfWeek) {
            isEventInWeek = true;
        }
        if (!isEventInWeek)
            continue;
        const firstDateOfEvent = isEventStartInWeek
            ? eventOriginalStartDate
            : firstDateOfWeek;
        const lastDateOfEvent = eventOriginalEndDate <= lastDateOfWeek
            ? eventOriginalEndDate
            : lastDateOfWeek;
        const eventDays = Object.values(week).filter((day) => {
            return day.date >= firstDateOfEvent && day.date <= lastDateOfEvent;
        });
        let levelInWeekForEvent;
        let testLevel = 0;
        while (levelInWeekForEvent === undefined) {
            const isLevelFree = eventDays.every((day) => {
                return !day.dateGridEvents[testLevel];
            });
            if (isLevelFree) {
                levelInWeekForEvent = testLevel;
                occupiedLevels.add(testLevel);
            }
            else
                testLevel++;
        }
        for (const [eventDayIndex, eventDay] of eventDays.entries()) {
            if (eventDayIndex === 0) {
                event._nDaysInGrid = eventDays.length;
                eventDay.dateGridEvents[levelInWeekForEvent] = event;
            }
            else {
                eventDay.dateGridEvents[levelInWeekForEvent] = DATE_GRID_BLOCKER;
            }
        }
    }
    for (const level of Array.from(occupiedLevels)) {
        for (const [, day] of Object.entries(week)) {
            if (!day.dateGridEvents[level]) {
                day.dateGridEvents[level] = undefined;
            }
        }
    }
    return week;
};

const getWidthToSubtract = (hasOverflowLeft, hasOverflowRight, enableOverflowSubtraction) => {
    let widthToSubtract = 2; // 2px for all events, to leave some space between them
    const eventOverflowMargin = 10; // CORRELATION ID: 1
    if (hasOverflowLeft && enableOverflowSubtraction)
        widthToSubtract += eventOverflowMargin;
    if (hasOverflowRight && enableOverflowSubtraction)
        widthToSubtract += eventOverflowMargin;
    return widthToSubtract;
};
const getBorderRadius = (hasOverflowLeft, hasOverflowRight, forceZeroRule) => {
    return {
        borderBottomLeftRadius: hasOverflowLeft || forceZeroRule ? 0 : undefined,
        borderTopLeftRadius: hasOverflowLeft || forceZeroRule ? 0 : undefined,
        borderBottomRightRadius: hasOverflowRight || forceZeroRule ? 0 : undefined,
        borderTopRightRadius: hasOverflowRight || forceZeroRule ? 0 : undefined,
    };
};

function DateGridEvent({ calendarEvent, gridRow, isCopy, }) {
    const $app = useContext(AppContext);
    const { eventCopy, updateCopy, setClickedEventIfNotDragging, createDragStartTimeout, } = useEventInteractions($app);
    const eventCSSVariables = {
        borderLeft: `4px solid var(--sx-color-${calendarEvent._color})`,
        color: `var(--sx-color-on-${calendarEvent._color}-container)`,
        backgroundColor: `var(--sx-color-${calendarEvent._color}-container)`,
    };
    const handleStartDrag = (uiEvent) => {
        if (!$app.config.plugins.dragAndDrop)
            return;
        if (isUIEventTouchEvent(uiEvent))
            uiEvent.preventDefault();
        const newEventCopy = deepCloneEvent(calendarEvent, $app);
        updateCopy(newEventCopy);
        $app.config.plugins.dragAndDrop.createDateGridDragHandler({
            eventCoordinates: getEventCoordinates(uiEvent),
            eventCopy: newEventCopy,
            updateCopy,
            $app,
        });
    };
    const hasOverflowLeft = dateFromDateTime(calendarEvent.start) <
        dateFromDateTime($app.calendarState.range.value.start);
    const hasOverflowRight = dateFromDateTime(calendarEvent.end) >
        dateFromDateTime($app.calendarState.range.value.end);
    const overflowStyles = { backgroundColor: eventCSSVariables.backgroundColor };
    const customComponent = $app.config._customComponentFns.dateGridEvent;
    let customComponentId = customComponent
        ? 'custom-date-grid-event-' + randomStringId() // needs a unique string to support event recurrence
        : undefined;
    if (isCopy && customComponentId)
        customComponentId += '-copy';
    useEffect(() => {
        if (!customComponent)
            return;
        customComponent(getElementByCCID(customComponentId), {
            calendarEvent: calendarEvent._getExternalEvent(),
        });
    }, []);
    const startResize = (mouseEvent) => {
        mouseEvent.stopPropagation();
        const eventCopy = deepCloneEvent(calendarEvent, $app);
        updateCopy(eventCopy);
        $app.config.plugins.resize.createDateGridEventResizer(eventCopy, updateCopy, mouseEvent);
    };
    const eventClasses = [
        'sx__event',
        'sx__date-grid-event',
        'sx__date-grid-cell',
    ];
    if (isCopy)
        eventClasses.push('sx__date-grid-event--copy');
    if (hasOverflowLeft)
        eventClasses.push('sx__date-grid-event--overflow-left');
    if (hasOverflowRight)
        eventClasses.push('sx__date-grid-event--overflow-right');
    const borderLeftNonCustom = hasOverflowLeft
        ? 'none'
        : eventCSSVariables.borderLeft;
    return (u(Fragment, { children: [u("div", { id: isCopy ? getTimeGridEventCopyElementId(calendarEvent.id) : undefined, tabIndex: 0, "aria-label": calendarEvent.title +
                    ' ' +
                    getTimeStamp(calendarEvent, $app.config.locale, $app.translate('to')), "data-ccid": customComponentId, "data-event-id": calendarEvent.id, onMouseDown: (e) => createDragStartTimeout(handleStartDrag, e), onMouseUp: (e) => setClickedEventIfNotDragging(calendarEvent, e), onTouchStart: (e) => createDragStartTimeout(handleStartDrag, e), onTouchEnd: (e) => setClickedEventIfNotDragging(calendarEvent, e), onClick: () => invokeOnEventClickCallback($app, calendarEvent), className: eventClasses.join(' '), style: {
                    width: `calc(${calendarEvent._nDaysInGrid * 100}% - ${getWidthToSubtract(hasOverflowLeft, hasOverflowRight, !customComponent)}px)`,
                    gridRow,
                    display: eventCopy ? 'none' : 'flex',
                    padding: customComponent ? '0px' : undefined,
                    borderLeft: customComponent ? undefined : borderLeftNonCustom,
                    color: customComponent ? undefined : eventCSSVariables.color,
                    backgroundColor: customComponent
                        ? undefined
                        : eventCSSVariables.backgroundColor,
                    ...getBorderRadius(hasOverflowLeft, hasOverflowRight, !!customComponent),
                }, children: [!customComponent && (u(Fragment, { children: [hasOverflowLeft && (u("div", { className: 'sx__date-grid-event--left-overflow', style: overflowStyles })), u("span", { className: "sx__date-grid-event-text", children: calendarEvent.title }), hasOverflowRight && (u("div", { className: 'sx__date-grid-event--right-overflow', style: overflowStyles }))] })), $app.config.plugins.resize && !hasOverflowRight && (u("div", { className: "sx__date-grid-event-resize-handle", onMouseDown: startResize }))] }), eventCopy && (u(DateGridEvent, { calendarEvent: eventCopy, gridRow: gridRow, isCopy: true }))] }));
}

function DateGridDay({ calendarEvents }) {
    return (u("div", { className: "sx__date-grid-day", children: Object.values(calendarEvents).map((event, index) => {
            if (event === DATE_GRID_BLOCKER || !event)
                return (u("div", { className: "sx__date-grid-cell", style: { gridRow: index + 1 } }));
            return u(DateGridEvent, { calendarEvent: event, gridRow: index + 1 });
        }) }));
}

const WeekWrapper = ({ $app, id }) => {
    var _a, _b;
    document.documentElement.style.setProperty('--sx-week-grid-height', `${$app.config.weekOptions.gridHeight}px`);
    const [week, setWeek] = useState({});
    const sortEventsIntoDateAndTimeGrids = () => {
        let newWeek = createWeek($app);
        const { dateGridEvents, timeGridEvents } = sortEventsForWeekView($app.calendarEvents.list.value);
        newWeek = positionInDateGrid(dateGridEvents.sort(sortEventsByStartAndEnd), newWeek);
        newWeek = positionInTimeGrid(timeGridEvents, newWeek, $app);
        setWeek(newWeek);
    };
    useEffect(() => {
        var _a, _b;
        const rangeStart = (_a = $app.calendarState.range.value) === null || _a === void 0 ? void 0 : _a.start;
        const rangeEnd = (_b = $app.calendarState.range.value) === null || _b === void 0 ? void 0 : _b.end;
        if (!rangeStart || !rangeEnd)
            return;
        sortEventsIntoDateAndTimeGrids();
    }, [
        (_a = $app.calendarState.range.value) === null || _a === void 0 ? void 0 : _a.start,
        (_b = $app.calendarState.range.value) === null || _b === void 0 ? void 0 : _b.end,
        $app.calendarEvents.list.value,
    ]);
    return (u(Fragment, { children: u(AppContext.Provider, { value: $app, children: u("div", { className: "sx__week-wrapper", id: id, children: [u("div", { className: "sx__week-header", children: u("div", { className: "sx__week-header-content", children: [u(DateAxis, { week: Object.values(week).map((day) => toJSDate(day.date)) }), u("div", { className: "sx__date-grid", "aria-label": $app.translate('Full day- and multiple day events'), children: Object.values(week).map((day) => (u(DateGridDay, { calendarEvents: day.dateGridEvents }, day.date + new Date().getTime()))) }), u("div", { className: "sx__week-header-border" })] }) }), u("div", { className: "sx__week-grid", children: [u(TimeAxis, {}), Object.values(week).map((day) => (u(TimeGridDay, { calendarEvents: day.timeGridEvents, date: day.date }, day.date + new Date().getTime())))] })] }) }) }));
};

const getRangeStartGivenDayBoundaries = (calendarConfig, date) => {
    return `${toDateString$1(date)} ${timeStringFromTimePoints(calendarConfig.dayBoundaries.start)}`;
};
const getRangeEndGivenDayBoundaries = (calendarConfig, date) => {
    let dayEndTimeString = timeStringFromTimePoints(calendarConfig.dayBoundaries.end);
    let newRangeEndDate = toDateString$1(date);
    if (calendarConfig.isHybridDay) {
        newRangeEndDate = addDays(newRangeEndDate, 1);
    }
    if (calendarConfig.dayBoundaries.end === 2400) {
        dayEndTimeString = '23:59';
    }
    return `${newRangeEndDate} ${dayEndTimeString}`;
};
const setRangeForWeek = (config) => {
    const weekForDate = config.timeUnitsImpl.getWeekFor(toJSDate(config.date));
    return {
        start: getRangeStartGivenDayBoundaries(config.calendarConfig, weekForDate[0]),
        end: getRangeEndGivenDayBoundaries(config.calendarConfig, weekForDate[weekForDate.length - 1]),
    };
};
const setRangeForMonth = (config) => {
    const { year, month } = toIntegers(config.date);
    const monthForDate = config.timeUnitsImpl.getMonthWithTrailingAndLeadingDays(year, month);
    const newRangeEndDate = toDateString$1(monthForDate[monthForDate.length - 1][monthForDate[monthForDate.length - 1].length - 1]);
    return {
        start: toDateTimeString(monthForDate[0][0]),
        end: `${newRangeEndDate} 23:59`,
    };
};
const setRangeForDay = (config) => {
    return {
        start: getRangeStartGivenDayBoundaries(config.calendarConfig, toJSDate(config.date)),
        end: getRangeEndGivenDayBoundaries(config.calendarConfig, toJSDate(config.date)),
    };
};

const viewWeek = createPreactView({
    name: InternalViewName.Week,
    label: 'Week',
    Component: WeekWrapper,
    setDateRange: setRangeForWeek,
    hasSmallScreenCompat: false,
    hasWideScreenCompat: true,
    backwardForwardFn: addDays,
    backwardForwardUnits: 7,
});

const createWeekForMonth = (week, day) => {
    week.push({
        date: toDateString$1(day),
        events: {},
    });
    return week;
};
const createMonth = (date, timeUnitsImpl) => {
    const { year, month: monthFromDate } = toIntegers(date);
    const monthWithDates = timeUnitsImpl.getMonthWithTrailingAndLeadingDays(year, monthFromDate);
    const month = [];
    for (const week of monthWithDates) {
        month.push(week.reduce(createWeekForMonth, []));
    }
    return month;
};

function MonthGridEvent({ gridRow, calendarEvent, date, }) {
    const $app = useContext(AppContext);
    const { createDragStartTimeout, setClickedEventIfNotDragging } = useEventInteractions($app);
    const hasStartDate = dateFromDateTime(calendarEvent.start) === date;
    const nDays = calendarEvent._eventFragments[date];
    const eventCSSVariables = {
        borderLeft: hasStartDate
            ? `4px solid var(--sx-color-${calendarEvent._color})`
            : undefined,
        color: `var(--sx-color-on-${calendarEvent._color}-container)`,
        backgroundColor: `var(--sx-color-${calendarEvent._color}-container)`,
        // CORRELATION ID: 2 (10px subtracted from width)
        // nDays * 100% for the width of each day + 1px for border - 10 px for horizontal gap between events
        width: `calc(${nDays * 100 + '%'} + ${nDays}px - 10px)`,
    };
    const handleStartDrag = (uiEvent) => {
        if (isUIEventTouchEvent(uiEvent))
            uiEvent.preventDefault();
        if (!uiEvent.target)
            return;
        if (!$app.config.plugins.dragAndDrop)
            return;
        $app.config.plugins.dragAndDrop.createMonthGridDragHandler(calendarEvent, $app);
    };
    const customComponent = $app.config._customComponentFns.monthGridEvent;
    const customComponentId = customComponent
        ? 'custom-month-grid-event-' + randomStringId() // needs a unique string to support event recurrence
        : undefined;
    useEffect(() => {
        if (!customComponent)
            return;
        customComponent(getElementByCCID(customComponentId), {
            calendarEvent: calendarEvent._getExternalEvent(),
            hasStartDate,
        });
    }, []);
    const handleOnClick = (e) => {
        e.stopPropagation(); // prevent the click from bubbling up to the day element
        invokeOnEventClickCallback($app, calendarEvent);
    };
    return (u("div", { draggable: !!$app.config.plugins.dragAndDrop, "data-event-id": calendarEvent.id, "data-ccid": customComponentId, onMouseDown: (e) => createDragStartTimeout(handleStartDrag, e), onMouseUp: (e) => setClickedEventIfNotDragging(calendarEvent, e), onTouchStart: (e) => createDragStartTimeout(handleStartDrag, e), onTouchEnd: (e) => setClickedEventIfNotDragging(calendarEvent, e), onClick: handleOnClick, className: "sx__event sx__month-grid-event sx__month-grid-cell", style: {
            gridRow,
            width: eventCSSVariables.width,
            padding: customComponent ? '0px' : undefined,
            borderLeft: customComponent ? undefined : eventCSSVariables.borderLeft,
            color: customComponent ? undefined : eventCSSVariables.color,
            backgroundColor: customComponent
                ? undefined
                : eventCSSVariables.backgroundColor,
        }, children: !customComponent && (u("div", { className: "sx__month-grid-event-title", children: calendarEvent.title })) }));
}

function MonthGridDay({ day, isFirstWeek }) {
    const $app = useContext(AppContext);
    const nEventsInDay = Object.values(day.events).filter((event) => typeof event === 'object' || event === DATE_GRID_BLOCKER).length;
    const getEventTranslationSingularOrPlural = (nOfAdditionalEvents) => {
        if (nOfAdditionalEvents === 1)
            return $app.translate('event');
        return $app.translate('events');
    };
    const handleClickAdditionalEvents = () => {
        if ($app.config.callbacks.onClickPlusEvents)
            $app.config.callbacks.onClickPlusEvents(day.date);
        if (!$app.config.views.find((view) => view.name === InternalViewName.Day))
            return;
        // Timeout to display the ripple effect
        setTimeout(() => {
            $app.datePickerState.selectedDate.value = day.date;
            $app.calendarState.view.value = InternalViewName.Day;
        }, 250);
    };
    const dateClassNames = ['sx__month-grid-day__header-date'];
    const dayDate = toJSDate(day.date);
    if (isToday(dayDate))
        dateClassNames.push('sx__is-today');
    return (u("div", { className: "sx__month-grid-day", "data-date": day.date, onClick: () => $app.config.callbacks.onClickDate &&
            $app.config.callbacks.onClickDate(day.date), children: [u("div", { className: "sx__month-grid-day__header", children: [isFirstWeek ? (u("div", { className: "sx__month-grid-day__header-day-name", children: getDayNameShort(dayDate, $app.config.locale) })) : null, u("div", { className: dateClassNames.join(' '), children: dayDate.getDate() })] }), u("div", { className: "sx__month-grid-day__events", children: Object.values(day.events)
                    .slice(0, $app.config.monthGridOptions.nEventsPerDay)
                    .map((event, index) => {
                    if (typeof event !== 'object')
                        return (u("div", { className: "sx__month-grid-blocker sx__month-grid-cell", style: { gridRow: index + 1 } }));
                    return (u(MonthGridEvent, { gridRow: index + 1, calendarEvent: event, date: day.date }));
                }) }), nEventsInDay > $app.config.monthGridOptions.nEventsPerDay ? (u("button", { className: "sx__month-grid-day__events-more sx__ripple--wide", onClick: handleClickAdditionalEvents, children: `+ ${nEventsInDay - $app.config.monthGridOptions.nEventsPerDay} ${getEventTranslationSingularOrPlural(nEventsInDay - $app.config.monthGridOptions.nEventsPerDay)}` })) : null] }));
}

function MonthGridWeek({ week, isFirstWeek }) {
    return (u("div", { className: "sx__month-grid-week", children: week.map((day) => (u(MonthGridDay, { day: day, isFirstWeek: isFirstWeek }))) }));
}

const positionInMonthWeek = (sortedEvents, week) => {
    const weekDates = Object.keys(week).sort();
    const firstDateOfWeek = weekDates[0];
    const lastDateOfWeek = weekDates[weekDates.length - 1];
    const occupiedLevels = new Set();
    for (const event of sortedEvents) {
        const eventOriginalStartDate = dateFromDateTime(event.start);
        const eventOriginalEndDate = dateFromDateTime(event.end);
        const isEventStartInWeek = !!week[eventOriginalStartDate];
        let isEventInWeek = isEventStartInWeek;
        if (!isEventStartInWeek &&
            eventOriginalStartDate < firstDateOfWeek &&
            eventOriginalEndDate >= firstDateOfWeek) {
            isEventInWeek = true;
        }
        if (!isEventInWeek)
            continue;
        const firstDateOfEvent = isEventStartInWeek
            ? eventOriginalStartDate
            : firstDateOfWeek;
        const lastDateOfEvent = eventOriginalEndDate <= lastDateOfWeek
            ? eventOriginalEndDate
            : lastDateOfWeek;
        const eventDays = Object.values(week).filter((day) => {
            return day.date >= firstDateOfEvent && day.date <= lastDateOfEvent;
        });
        let levelInWeekForEvent;
        let testLevel = 0;
        while (levelInWeekForEvent === undefined) {
            const isLevelFree = eventDays.every((day) => {
                return !day.events[testLevel];
            });
            if (isLevelFree) {
                levelInWeekForEvent = testLevel;
                occupiedLevels.add(testLevel);
            }
            else
                testLevel++;
        }
        for (const [eventDayIndex, eventDay] of eventDays.entries()) {
            if (eventDayIndex === 0) {
                event._eventFragments[firstDateOfEvent] = eventDays.length;
                eventDay.events[levelInWeekForEvent] = event;
            }
            else {
                eventDay.events[levelInWeekForEvent] = DATE_GRID_BLOCKER;
            }
        }
    }
    for (const level of Array.from(occupiedLevels)) {
        for (const [, day] of Object.entries(week)) {
            if (!day.events[level]) {
                day.events[level] = undefined;
            }
        }
    }
    return week;
};
const positionInMonth = (month, sortedEvents) => {
    const weeks = [];
    month.forEach((week) => {
        const weekMap = {};
        week.forEach((day) => (weekMap[day.date] = day));
        weeks.push(weekMap);
    });
    weeks.forEach((week) => positionInMonthWeek(sortedEvents, week));
    return month;
};

const MonthGridWrapper = ({ $app, id }) => {
    var _a, _b;
    const [month, setMonth] = useState([]);
    useEffect(() => {
        $app.calendarEvents.list.value.forEach((event) => {
            event._eventFragments = {};
        });
        const newMonth = createMonth($app.datePickerState.selectedDate.value, $app.timeUnitsImpl);
        setMonth(positionInMonth(newMonth, $app.calendarEvents.list.value.sort(sortEventsByStartAndEnd)));
    }, [
        (_a = $app.calendarState.range.value) === null || _a === void 0 ? void 0 : _a.start,
        (_b = $app.calendarState.range.value) === null || _b === void 0 ? void 0 : _b.end,
        $app.calendarEvents.list.value,
    ]);
    return (u(AppContext.Provider, { value: $app, children: u("div", { id: id, className: "sx__month-grid-wrapper", children: month.map((week, index) => (u(MonthGridWeek, { week: week, isFirstWeek: index === 0 }, index + new Date().getTime()))) }) }));
};

const viewMonthGrid = createPreactView({
    name: InternalViewName.MonthGrid,
    label: 'Month',
    setDateRange: setRangeForMonth,
    Component: MonthGridWrapper,
    hasWideScreenCompat: true,
    hasSmallScreenCompat: false,
    backwardForwardFn: addMonths,
    backwardForwardUnits: 1,
});

const DayWrapper = ({ $app, id }) => {
    return u(WeekWrapper, { "$app": $app, id: id });
};

const viewDay = createPreactView({
    name: InternalViewName.Day,
    label: 'Day',
    setDateRange: setRangeForDay,
    hasWideScreenCompat: true,
    hasSmallScreenCompat: true,
    Component: DayWrapper,
    backwardForwardFn: addDays,
    backwardForwardUnits: 1,
});

const createAgendaMonth = (date, timeUnitsImpl) => {
    const { year, month } = toIntegers(date);
    const monthWithDates = timeUnitsImpl.getMonthWithTrailingAndLeadingDays(year, month);
    return {
        weeks: monthWithDates.map((week) => {
            return week.map((date) => {
                return {
                    date: toDateString$1(date),
                    events: [],
                };
            });
        }),
    };
};

function MonthAgendaDay({ day, isActive, setActiveDate, }) {
    const $app = useContext(AppContext);
    const { month: monthSelected } = toIntegers($app.datePickerState.selectedDate.value);
    const { month: monthOfDay } = toIntegers(day.date);
    const dayClasses = ['sx__month-agenda-day'];
    if (isActive)
        dayClasses.push('sx__month-agenda-day--active');
    if (monthOfDay !== monthSelected)
        dayClasses.push('is-leading-or-trailing');
    return (u("div", { className: dayClasses.join(' '), onClick: () => setActiveDate(day.date), children: [u("div", { children: toJSDate(day.date).getDate() }), u("div", { className: "sx__month-agenda-day__event-icons", children: day.events.slice(0, 3).map((event) => (u("div", { style: {
                        backgroundColor: `var(--sx-color-${event._color})`,
                        filter: `brightness(1.6)`,
                    }, className: "sx__month-agenda-day__event-icon" }))) })] }));
}

function MonthAgendaWeek({ week, setActiveDate, activeDate, }) {
    return (u("div", { className: "sx__month-agenda-week", children: week.map((day, index) => (u(MonthAgendaDay, { setActiveDate: setActiveDate, day: day, isActive: activeDate === day.date }, index + day.date))) }));
}

function MonthAgendaDayNames({ week }) {
    const $app = useContext(AppContext);
    const localizedShortDayNames = getOneLetterOrShortDayNames(week.map((day) => toJSDate(day.date)), $app.config.locale);
    return (u("div", { className: "sx__month-agenda-day-names", children: localizedShortDayNames.map((oneLetterDayName) => (u("div", { className: "sx__month-agenda-day-name", children: oneLetterDayName }))) }));
}

const getAllEventDates = (startDate, endDate) => {
    let currentDate = startDate;
    const dates = [currentDate];
    while (currentDate < endDate) {
        currentDate = addDays(currentDate, 1);
        dates.push(currentDate);
    }
    return dates;
};
const placeEventInDay = (allDaysMap) => (event) => {
    getAllEventDates(dateFromDateTime(event.start), dateFromDateTime(event.end)).forEach((date) => {
        if (allDaysMap[date]) {
            allDaysMap[date].events.push(event);
        }
    });
};
const positionEventsInAgenda = (agendaMonth, eventsSortedByStart) => {
    const allDaysMap = agendaMonth.weeks.reduce((acc, week) => {
        week.forEach((day) => {
            acc[day.date] = day;
        });
        return acc;
    }, {});
    eventsSortedByStart.forEach(placeEventInDay(allDaysMap));
    return agendaMonth;
};

function MonthAgendaEvent({ calendarEvent }) {
    const $app = useContext(AppContext);
    const { setClickedEvent } = useEventInteractions($app);
    const eventCSSVariables = {
        backgroundColor: `var(--sx-color-${calendarEvent._color}-container)`,
        color: `var(--sx-color-on-${calendarEvent._color}-container)`,
        borderLeft: `4px solid var(--sx-color-${calendarEvent._color})`,
    };
    const customComponent = $app.config._customComponentFns.monthAgendaEvent;
    const customComponentId = customComponent
        ? 'custom-month-agenda-event-' + calendarEvent.id
        : undefined;
    useEffect(() => {
        if (!customComponent)
            return;
        customComponent(getElementByCCID(customComponentId), {
            calendarEvent: calendarEvent._getExternalEvent(),
        });
    }, []);
    const onClick = (e) => {
        invokeOnEventClickCallback($app, calendarEvent);
        setClickedEvent(e, calendarEvent);
    };
    return (u("div", { className: "sx__event sx__month-agenda-event", "data-ccid": customComponentId, "data-event-id": calendarEvent.id, style: {
            backgroundColor: customComponent
                ? undefined
                : eventCSSVariables.backgroundColor,
            color: customComponent ? undefined : eventCSSVariables.color,
            borderLeft: customComponent ? undefined : eventCSSVariables.borderLeft,
            padding: customComponent ? '0px' : undefined,
        }, onClick: (e) => onClick(e), children: !customComponent && (u(Fragment, { children: [u("div", { className: "sx__month-agenda-event__title", children: calendarEvent.title }), u("div", { className: "sx__month-agenda-event__time sx__month-agenda-event__has-icon", children: [u(TimeIcon, { strokeColor: `var(--sx-color-on-${calendarEvent._color}-container)` }), getTimeStamp(calendarEvent, $app.config.locale)] })] })) }));
}

function MonthAgendaEvents({ events }) {
    const $app = useContext(AppContext);
    return (u("div", { className: "sx__month-agenda-events", children: events.length ? (events.map((event) => (u(MonthAgendaEvent, { calendarEvent: event }, event.id)))) : (u("div", { className: "sx__month-agenda-events__empty", children: $app.translate('No events') })) }));
}

const MonthAgendaWrapper = ({ $app, id }) => {
    var _a;
    const getMonth = () => positionEventsInAgenda(createAgendaMonth($app.datePickerState.selectedDate.value, $app.timeUnitsImpl), $app.calendarEvents.list.value.sort(sortEventsByStartAndEnd));
    const [agendaMonth, setAgendaMonth] = useState(getMonth());
    useEffect(() => {
        setAgendaMonth(getMonth());
    }, [$app.datePickerState.selectedDate.value, $app.calendarEvents.list.value]);
    const [activeDate, setActiveDate] = useState($app.datePickerState.selectedDate.value);
    return (u(AppContext.Provider, { value: $app, children: u("div", { id: id, className: "sx__month-agenda-wrapper", children: [u(MonthAgendaDayNames, { week: agendaMonth.weeks[0] }), u("div", { className: "sx__month-agenda-weeks", children: agendaMonth.weeks.map((week, index) => (u(MonthAgendaWeek, { week: week, setActiveDate: setActiveDate, activeDate: activeDate }, index + new Date().getTime()))) }), u(MonthAgendaEvents, { events: ((_a = agendaMonth.weeks.flat().find((day) => day.date === activeDate)) === null || _a === void 0 ? void 0 : _a.events) || [] }, activeDate + new Date().getTime())] }) }));
};

const viewMonthAgenda = createPreactView({
    name: InternalViewName.MonthAgenda,
    label: 'Month',
    setDateRange: setRangeForMonth,
    Component: MonthAgendaWrapper,
    hasSmallScreenCompat: true,
    hasWideScreenCompat: false,
    backwardForwardFn: addMonths,
    backwardForwardUnits: 1,
});

export { CalendarApp, createCalendar, createPreactView, externalEventToInternal, setRangeForDay, setRangeForMonth, setRangeForWeek, viewDay, viewMonthAgenda, viewMonthGrid, viewWeek };
