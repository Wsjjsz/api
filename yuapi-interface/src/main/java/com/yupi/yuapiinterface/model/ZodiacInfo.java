package com.yupi.yuapiinterface.model;

import java.io.Serializable;

/**
 * 星座信息返回结构
 */
public class ZodiacInfo implements Serializable {

    private String sign;
    private String signEn;
    private String dateRange;
    private String element;
    private String keywords;
    private String description;

    public ZodiacInfo() {
    }

    public ZodiacInfo(String sign, String signEn, String dateRange, String element, String keywords, String description) {
        this.sign = sign;
        this.signEn = signEn;
        this.dateRange = dateRange;
        this.element = element;
        this.keywords = keywords;
        this.description = description;
    }

    public String getSign() {
        return sign;
    }

    public void setSign(String sign) {
        this.sign = sign;
    }

    public String getSignEn() {
        return signEn;
    }

    public void setSignEn(String signEn) {
        this.signEn = signEn;
    }

    public String getDateRange() {
        return dateRange;
    }

    public void setDateRange(String dateRange) {
        this.dateRange = dateRange;
    }

    public String getElement() {
        return element;
    }

    public void setElement(String element) {
        this.element = element;
    }

    public String getKeywords() {
        return keywords;
    }

    public void setKeywords(String keywords) {
        this.keywords = keywords;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }
}

