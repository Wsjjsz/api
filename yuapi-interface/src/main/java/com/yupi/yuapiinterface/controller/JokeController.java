package com.yupi.yuapiinterface.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.ThreadLocalRandom;

/**
 * 笑话接口
 */
@RestController
@RequestMapping("/joke")
public class JokeController {

    private static final List<String> JOKES = Arrays.asList(
            "程序员最浪漫的事：和你一起慢慢变老，然后把需求都删掉。",
            "产品经理说：这个功能很简单。程序员听完，打开了搜索引擎。",
            "bug和程序员的关系：你不找它，它也会来找你。",
            "加班到深夜，键盘都认识我了，老板还不认识。",
            "面试官：你最大的优点？我：善于解决昨天写下的 bug。",
            "需求评审会：三分钟讲需求，三小时讨论边界。",
            "前端问后端：接口呢？后端问前端：页面呢？最后项目经理先下班了。",
            "写代码像写诗，只是读者通常只有自己和编译器。",
            "今天不想写代码，结果花了一天优化了代码格式。",
            "当你觉得代码很优雅时，未来的你通常不同意。"
    );

    @GetMapping("/random")
    public Map<String, String> randomJoke() {
        int index = ThreadLocalRandom.current().nextInt(JOKES.size());
        Map<String, String> result = new LinkedHashMap<>();
        result.put("content", JOKES.get(index));
        return result;
    }

    @GetMapping("/list")
    public Map<String, Object> listJokes(@RequestParam(value = "page", defaultValue = "1") int page,
                                         @RequestParam(value = "pageSize", defaultValue = "5") int pageSize) {
        if (page <= 0) {
            page = 1;
        }
        if (pageSize <= 0) {
            pageSize = 5;
        }
        int total = JOKES.size();
        int fromIndex = (page - 1) * pageSize;
        int toIndex = Math.min(fromIndex + pageSize, total);
        List<String> records = new ArrayList<>();
        if (fromIndex < total) {
            records = JOKES.subList(fromIndex, toIndex);
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("page", page);
        result.put("pageSize", pageSize);
        result.put("total", total);
        result.put("records", records);
        return result;
    }
}
