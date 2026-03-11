package com.yupi.yuapiinterface.controller;

import com.yupi.yuapiinterface.model.ZodiacInfo;
import org.springframework.util.StringUtils;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.Collections;
import java.util.HashMap;
import java.util.Locale;
import java.util.Map;

/**
 * 星座信息查询 API
 */
@RestController
@RequestMapping("/zodiac")
public class ZodiacController {

    private static final Map<String, ZodiacInfo> ZODIAC_MAP = buildZodiacMap();

    /**
     * 查询星座信息
     *
     * 示例：
     * - /api/zodiac/info?sign=白羊座
     * - /api/zodiac/info?sign=aries
     * - /api/zodiac/info?sign=Aries
     */
    @GetMapping("/info")
    public ZodiacInfo getZodiacInfo(@RequestParam("sign") String sign) {
        if (!StringUtils.hasText(sign)) {
            throw new IllegalArgumentException("sign 不能为空");
        }
        String key = normalizeKey(sign);
        ZodiacInfo info = ZODIAC_MAP.get(key);
        if (info == null) {
            throw new IllegalArgumentException("不支持的星座: " + sign);
        }
        return info;
    }

    private static String normalizeKey(String sign) {
        String s = sign.trim();
        // 去掉常见后缀
        if (s.endsWith("座")) {
            s = s.substring(0, s.length() - 1);
        }
        // 全部转小写（英文）
        return s.toLowerCase(Locale.ROOT);
    }

    private static Map<String, ZodiacInfo> buildZodiacMap() {
        Map<String, ZodiacInfo> m = new HashMap<>();

        put(m, new ZodiacInfo("白羊座", "aries", "03-21~04-19", "火象", "冲劲 / 直率 / 行动力", "热情直接，喜欢先行动再调整。"));
        put(m, new ZodiacInfo("金牛座", "taurus", "04-20~05-20", "土象", "稳定 / 享受 / 可靠", "务实稳重，重视安全感与持续投入。"));
        put(m, new ZodiacInfo("双子座", "gemini", "05-21~06-21", "风象", "好奇 / 交流 / 灵活", "思维跳跃，擅长沟通与快速学习。"));
        put(m, new ZodiacInfo("巨蟹座", "cancer", "06-22~07-22", "水象", "敏感 / 关怀 / 保护欲", "情感细腻，重视家庭与情绪连接。"));
        put(m, new ZodiacInfo("狮子座", "leo", "07-23~08-22", "火象", "自信 / 表达 / 领导力", "热爱舞台与认可，愿意承担与带动。"));
        put(m, new ZodiacInfo("处女座", "virgo", "08-23~09-22", "土象", "细致 / 规划 / 追求更好", "注重细节与效率，偏好有序与改进。"));
        put(m, new ZodiacInfo("天秤座", "libra", "09-23~10-23", "风象", "平衡 / 审美 / 协调", "在关系与选择中追求公平与和谐。"));
        put(m, new ZodiacInfo("天蝎座", "scorpio", "10-24~11-22", "水象", "深度 / 专注 / 边界感", "情感浓烈，洞察力强，重视信任。"));
        put(m, new ZodiacInfo("射手座", "sagittarius", "11-23~12-21", "火象", "自由 / 探索 / 乐观", "喜欢远行与新体验，重视成长与意义。"));
        put(m, new ZodiacInfo("摩羯座", "capricorn", "12-22~01-19", "土象", "目标 / 自律 / 责任", "踏实克制，擅长长期规划与执行。"));
        put(m, new ZodiacInfo("水瓶座", "aquarius", "01-20~02-18", "风象", "独立 / 创新 / 观念", "思维前卫，重视个人空间与独特价值。"));
        put(m, new ZodiacInfo("双鱼座", "pisces", "02-19~03-20", "水象", "共情 / 想象 / 浪漫", "富有同理心与想象力，情绪感受强。"));

        return Collections.unmodifiableMap(m);
    }

    private static void put(Map<String, ZodiacInfo> m, ZodiacInfo info) {
        // 中文 key：去掉“座”后的小写（中文无大小写影响）
        m.put(normalizeKey(info.getSign()), info);
        // 英文 key：小写
        m.put(normalizeKey(info.getSignEn()), info);
    }
}

