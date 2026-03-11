
package com.yupi.project.provider;

import org.apache.dubbo.config.annotation.DubboService;

import java.util.Random;

@DubboService
public class NameServiceImpl implements NameService {

    private static final String[] XING = {"王", "李", "张", "刘", "陈", "杨", "黄", "赵", "周", "吴", "徐", "孙", "胡", "朱", "高", "林", "何", "郭", "马", "罗"};
    private static final String[] MING = {"伟", "芳", "娜", "敏", "静", "秀", "强", "磊", "军", "洋", "勇", "艳", "杰", "娟", "涛", "明", "超", "秀英", "丽", "刚"};

    @Override
    public String getRandomName() {
        Random random = new Random();
        String xing = XING[random.nextInt(XING.length)];
        String ming = MING[random.nextInt(MING.length)];
        return xing + ming;
    }
}
