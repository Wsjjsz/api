package com.yupi.yuapiinterface.controller;

import org.springframework.util.StringUtils;
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
import java.util.stream.Collectors;

/**
 * 古诗词接口
 */
@RestController
@RequestMapping("/poetry")
public class PoetryController {

    private static final List<Poetry> POETRY_LIST = Arrays.asList(
            new Poetry("静夜思", "李白", "唐", "床前明月光，疑是地上霜。举头望明月，低头思故乡。"),
            new Poetry("春晓", "孟浩然", "唐", "春眠不觉晓，处处闻啼鸟。夜来风雨声，花落知多少。"),
            new Poetry("登鹳雀楼", "王之涣", "唐", "白日依山尽，黄河入海流。欲穷千里目，更上一层楼。"),
            new Poetry("望庐山瀑布", "李白", "唐", "日照香炉生紫烟，遥看瀑布挂前川。飞流直下三千尺，疑是银河落九天。"),
            new Poetry("江雪", "柳宗元", "唐", "千山鸟飞绝，万径人踪灭。孤舟蓑笠翁，独钓寒江雪。"),
            new Poetry("赋得古原草送别", "白居易", "唐", "离离原上草，一岁一枯荣。野火烧不尽，春风吹又生。"),
            new Poetry("泊船瓜洲", "王安石", "宋", "京口瓜洲一水间，钟山只隔数重山。春风又绿江南岸，明月何时照我还。"),
            new Poetry("题西林壁", "苏轼", "宋", "横看成岭侧成峰，远近高低各不同。不识庐山真面目，只缘身在此山中。"),
            new Poetry("游子吟", "孟郊", "唐", "慈母手中线，游子身上衣。临行密密缝，意恐迟迟归。"),
            new Poetry("饮湖上初晴后雨", "苏轼", "宋", "水光潋滟晴方好，山色空蒙雨亦奇。欲把西湖比西子，淡妆浓抹总相宜。")
    );

    @GetMapping("/random")
    public Map<String, String> randomPoetry() {
        Poetry poetry = POETRY_LIST.get(ThreadLocalRandom.current().nextInt(POETRY_LIST.size()));
        return toMap(poetry);
    }

    @GetMapping("/search")
    public List<Map<String, String>> searchPoetry(@RequestParam("keyword") String keyword) {
        if (!StringUtils.hasText(keyword)) {
            return POETRY_LIST.stream().limit(5).map(this::toMap).collect(Collectors.toList());
        }
        String key = keyword.trim();
        List<Map<String, String>> result = new ArrayList<>();
        for (Poetry poetry : POETRY_LIST) {
            if (poetry.title.contains(key) || poetry.author.contains(key) || poetry.content.contains(key)) {
                result.add(toMap(poetry));
            }
        }
        return result;
    }

    private Map<String, String> toMap(Poetry poetry) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("title", poetry.title);
        map.put("author", poetry.author);
        map.put("dynasty", poetry.dynasty);
        map.put("content", poetry.content);
        return map;
    }

    private static class Poetry {
        private final String title;
        private final String author;
        private final String dynasty;
        private final String content;

        private Poetry(String title, String author, String dynasty, String content) {
            this.title = title;
            this.author = author;
            this.dynasty = dynasty;
            this.content = content;
        }
    }
}
