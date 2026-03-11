package com.yupi.yuapiinterface.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DateTimeException;
import java.time.DayOfWeek;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.time.temporal.WeekFields;
import java.util.LinkedHashMap;
import java.util.Locale;
import java.util.Map;

/**
 * 万年历接口
 */
@RestController
@RequestMapping("/calendar")
public class CalendarController {

    private static final DateTimeFormatter DATE_FORMATTER = DateTimeFormatter.ofPattern("yyyy-MM-dd");

    @GetMapping("/day")
    public Map<String, Object> getDayInfo(@RequestParam(value = "date", required = false) String date) {
        LocalDate targetDate = parseDate(date);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("date", targetDate.format(DATE_FORMATTER));
        result.put("year", targetDate.getYear());
        result.put("month", targetDate.getMonthValue());
        result.put("day", targetDate.getDayOfMonth());
        result.put("dayOfWeek", toZhDayOfWeek(targetDate.getDayOfWeek()));
        result.put("weekOfYear", targetDate.get(WeekFields.ISO.weekOfWeekBasedYear()));
        result.put("dayOfYear", targetDate.getDayOfYear());
        result.put("daysInMonth", targetDate.lengthOfMonth());
        result.put("isLeapYear", targetDate.isLeapYear());
        result.put("isWeekend", isWeekend(targetDate.getDayOfWeek()));
        result.put("quarter", (targetDate.getMonthValue() - 1) / 3 + 1);
        return result;
    }

    private LocalDate parseDate(String date) {
        if (date == null || date.trim().isEmpty()) {
            return LocalDate.now();
        }
        try {
            return LocalDate.parse(date.trim(), DATE_FORMATTER);
        } catch (DateTimeException e) {
            throw new IllegalArgumentException("日期格式错误，示例：2026-03-10");
        }
    }

    private String toZhDayOfWeek(DayOfWeek dayOfWeek) {
        switch (dayOfWeek) {
            case MONDAY:
                return "星期一";
            case TUESDAY:
                return "星期二";
            case WEDNESDAY:
                return "星期三";
            case THURSDAY:
                return "星期四";
            case FRIDAY:
                return "星期五";
            case SATURDAY:
                return "星期六";
            case SUNDAY:
                return "星期日";
            default:
                return dayOfWeek.getDisplayName(java.time.format.TextStyle.FULL, Locale.CHINA);
        }
    }

    private boolean isWeekend(DayOfWeek dayOfWeek) {
        return dayOfWeek == DayOfWeek.SATURDAY || dayOfWeek == DayOfWeek.SUNDAY;
    }
}
