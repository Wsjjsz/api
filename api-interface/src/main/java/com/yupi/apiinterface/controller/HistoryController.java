package com.yupi.apiinterface.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.time.DateTimeException;
import java.time.LocalDate;
import java.time.MonthDay;
import java.time.format.DateTimeFormatter;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;

/**
 * 历史上的今天接口
 */
@RestController
@RequestMapping("/history")
public class HistoryController {

    private static final DateTimeFormatter MONTH_DAY_FORMATTER = DateTimeFormatter.ofPattern("MM-dd");
    private static final Map<String, List<String>> HISTORY_MAP = buildHistoryMap();

    @GetMapping("/today")
    public Map<String, Object> today(@RequestParam(value = "month", required = false) Integer month,
                                     @RequestParam(value = "day", required = false) Integer day) {
        MonthDay monthDay;
        if (month == null || day == null) {
            LocalDate now = LocalDate.now();
            monthDay = MonthDay.of(now.getMonthValue(), now.getDayOfMonth());
        } else {
            try {
                monthDay = MonthDay.of(month, day);
            } catch (DateTimeException e) {
                throw new IllegalArgumentException("month/day 参数非法");
            }
        }
        String key = monthDay.format(MONTH_DAY_FORMATTER);
        List<String> events = HISTORY_MAP.getOrDefault(key, new ArrayList<String>());

        Map<String, Object> result = new LinkedHashMap<>();
        result.put("date", key);
        result.put("eventCount", events.size());
        result.put("events", events);
        return result;
    }

    private static Map<String, List<String>> buildHistoryMap() {
        Map<String, List<String>> map = new LinkedHashMap<>();
        map.put("01-01", Arrays.asList(
                "1912年：中华民国成立。",
                "1999年：欧元在11国启动。"
        ));
        map.put("02-14", Arrays.asList(
                "1876年：贝尔申请电话专利。",
                "2005年：YouTube正式上线。"
        ));
        map.put("03-10", Arrays.asList(
                "1876年：人类首次完成电话通话实验。",
                "1959年：西藏民主改革开始。"
        ));
        map.put("05-04", Arrays.asList(
                "1919年：五四运动爆发。"
        ));
        map.put("07-20", Arrays.asList(
                "1969年：阿波罗11号宇航员首次登月。"
        ));
        map.put("10-01", Arrays.asList(
                "1949年：中华人民共和国成立。"
        ));
        map.put("12-31", Arrays.asList(
                "1999年：千禧年前夜全球庆典。"
        ));
        return map;
    }
}
