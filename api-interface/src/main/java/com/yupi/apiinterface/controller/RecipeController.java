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
 * 菜谱接口
 */
@RestController
@RequestMapping("/recipe")
public class RecipeController {

    private static final List<Recipe> RECIPES = Arrays.asList(
            new Recipe("番茄炒蛋", "家常菜", "番茄、鸡蛋、盐、糖",
                    "鸡蛋打散炒熟盛出；番茄炒软出汁；回锅鸡蛋翻炒调味。"),
            new Recipe("宫保鸡丁", "川菜", "鸡胸肉、花生米、黄瓜、干辣椒、花椒",
                    "鸡丁腌制后滑炒；爆香辣椒花椒；加配菜和料汁翻炒收汁。"),
            new Recipe("鱼香肉丝", "川菜", "猪里脊、木耳、胡萝卜、青椒",
                    "肉丝上浆滑炒；配菜炒断生；加入鱼香汁大火翻匀。"),
            new Recipe("清炒西兰花", "素菜", "西兰花、蒜末、盐",
                    "西兰花焯水；蒜末爆香；下西兰花快炒并调味。"),
            new Recipe("可乐鸡翅", "快手菜", "鸡翅、可乐、生抽、姜片",
                    "鸡翅煎至两面金黄；加可乐和调料焖煮；大火收汁。"),
            new Recipe("红烧茄子", "家常菜", "茄子、蒜末、青椒、生抽、蚝油",
                    "茄子过油或煎软；爆香蒜末；加调料和配菜翻炒。"),
            new Recipe("蛋炒饭", "主食", "米饭、鸡蛋、葱花、火腿丁",
                    "鸡蛋炒散；下米饭炒松；加配料调味炒香。"),
            new Recipe("冬瓜排骨汤", "汤品", "排骨、冬瓜、姜片、盐",
                    "排骨焯水后炖煮；加入冬瓜再煮；最后调盐。")
    );

    @GetMapping("/random")
    public Map<String, String> randomRecipe() {
        Recipe recipe = RECIPES.get(ThreadLocalRandom.current().nextInt(RECIPES.size()));
        return toMap(recipe);
    }

    @GetMapping("/search")
    public List<Map<String, String>> searchRecipe(@RequestParam("keyword") String keyword) {
        if (!StringUtils.hasText(keyword)) {
            throw new IllegalArgumentException("keyword 不能为空");
        }
        String key = keyword.trim();
        List<Map<String, String>> result = new ArrayList<>();
        for (Recipe recipe : RECIPES) {
            if (recipe.name.contains(key) || recipe.ingredients.contains(key) || recipe.type.contains(key)) {
                result.add(toMap(recipe));
            }
        }
        return result;
    }

    private Map<String, String> toMap(Recipe recipe) {
        Map<String, String> map = new LinkedHashMap<>();
        map.put("name", recipe.name);
        map.put("type", recipe.type);
        map.put("ingredients", recipe.ingredients);
        map.put("steps", recipe.steps);
        return map;
    }

    private static class Recipe {
        private final String name;
        private final String type;
        private final String ingredients;
        private final String steps;

        private Recipe(String name, String type, String ingredients, String steps) {
            this.name = name;
            this.type = type;
            this.ingredients = ingredients;
            this.steps = steps;
        }
    }
}
