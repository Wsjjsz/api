package com.yupi.apiinterface.controller;

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

/**
 * 成语接口
 */
@RestController
@RequestMapping("/idiom")
public class IdiomController {

    private static final List<Idiom> IDIOMS = Arrays.asList(
            new Idiom("一鸣惊人", "比喻平时没有突出表现，一下子做出惊人成绩。"),
            new Idiom("人山人海", "形容聚集的人很多。"),
            new Idiom("海阔天空", "形容大自然广阔，也比喻想象或言谈无拘无束。"),
            new Idiom("空前绝后", "以前没有过，以后也不会再有。"),
            new Idiom("后来居上", "后来的超过先前的。"),
            new Idiom("上行下效", "上面怎么做，下面就学着怎么做。"),
            new Idiom("效犬马力", "表示愿意尽力效劳。"),
            new Idiom("力争上游", "努力奋斗，争取先进。"),
            new Idiom("游刃有余", "做事熟练，轻松利落。"),
            new Idiom("余音绕梁", "歌声优美，给人留下深刻印象。"),
            new Idiom("梁上君子", "古代对窃贼的委婉说法。"),
            new Idiom("子虚乌有", "指假设的、不存在的事情。"),
            new Idiom("有口皆碑", "人人称赞。"),
            new Idiom("碑沉汉水", "比喻功名不显。"),
            new Idiom("水到渠成", "条件成熟，事情自然成功。")
    );

    @GetMapping("/next")
    public Map<String, Object> next(@RequestParam("text") String text) {
        if (!StringUtils.hasText(text)) {
            throw new IllegalArgumentException("text 不能为空");
        }
        char lastChar = text.trim().charAt(text.trim().length() - 1);
        List<Map<String, String>> candidates = new ArrayList<>();
        for (Idiom idiom : IDIOMS) {
            if (idiom.word.charAt(0) == lastChar && !idiom.word.equals(text.trim())) {
                candidates.add(toMap(idiom));
            }
        }
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("input", text.trim());
        result.put("nextCount", candidates.size());
        result.put("nextList", candidates);
        return result;
    }

    @GetMapping("/random")
    public Map<String, String> random() {
        Idiom idiom = IDIOMS.get(ThreadLocalRandom.current().nextInt(IDIOMS.size()));
        return toMap(idiom);
    }

    private Map<String, String> toMap(Idiom idiom) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("word", idiom.word);
        map.put("meaning", idiom.meaning);
        return map;
    }

    private static class Idiom {
        private final String word;
        private final String meaning;

        private Idiom(String word, String meaning) {
            this.word = word;
            this.meaning = meaning;
        }
    }
}
