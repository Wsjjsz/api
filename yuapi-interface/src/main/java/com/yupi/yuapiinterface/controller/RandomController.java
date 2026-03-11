package com.yupi.yuapiinterface.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.LinkedHashMap;
import java.util.LinkedHashSet;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 随机工具接口
 */
@RestController
@RequestMapping("/random")
public class RandomController {

    @GetMapping("/number")
    public Map<String, Object> randomNumber(@RequestParam(value = "min", defaultValue = "0") int min,
                                            @RequestParam(value = "max", defaultValue = "100") int max,
                                            @RequestParam(value = "count", defaultValue = "1") int count,
                                            @RequestParam(value = "allowRepeat", defaultValue = "false") boolean allowRepeat) {
        if (min > max) {
            throw new IllegalArgumentException("min 不能大于 max");
        }
        if (count <= 0 || count > 1000) {
            throw new IllegalArgumentException("count 取值范围为 1~1000");
        }
        int range = max - min + 1;
        if (!allowRepeat && count > range) {
            throw new IllegalArgumentException("不允许重复时，count 不能超过区间大小");
        }
        List<Integer> numbers = generateNumbers(min, max, count, allowRepeat);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("min", min);
        result.put("max", max);
        result.put("count", count);
        result.put("allowRepeat", allowRepeat);
        result.put("numbers", numbers);
        return result;
    }

    private List<Integer> generateNumbers(int min, int max, int count, boolean allowRepeat) {
        ThreadLocalRandom random = ThreadLocalRandom.current();
        if (allowRepeat) {
            List<Integer> result = new ArrayList<>();
            for (int i = 0; i < count; i++) {
                result.add(random.nextInt(min, max + 1));
            }
            return result;
        }
        Set<Integer> unique = new LinkedHashSet<>();
        while (unique.size() < count) {
            unique.add(random.nextInt(min, max + 1));
        }
        return new ArrayList<>(unique);
    }
}
