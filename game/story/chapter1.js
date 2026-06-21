// 第一章「墙上的她」：bedroom / tunnel / classroom —— 舞台加厚已落地（换景/走位/立绘登场/色板/演出拍；结构经程序校验未改动，node 生成）。

export const bedroom = {
  "id": "bedroom",
  "bg": "home",
  "palette": "night",
  "cast": {
    "sprite": "ganshi",
    "x": 132,
    "y": 34
  },
  "next": "tunnel",
  "script": [
    {
      "say": "",
      "text": "凌晨五点半，天光还没透进窗帘缝。"
    },
    {
      "say": "",
      "text": "出租屋里一股潮味，空调在低声嗡鸣。"
    },
    {
      "say": "",
      "text": "窗外偶尔几声鸟叫，远得像隔着一层水。"
    },
    {
      "say": "",
      "text": "耳机里轻音乐淌着，龙荻翻了个身。"
    },
    {
      "say": "龙荻",
      "text": "（再眯一会儿……天就亮了……）"
    },
    {
      "say": "",
      "text": "他睁开眼，目光落到门后那面墙上。",
      "cast": null
    },
    {
      "say": "",
      "text": "他的呼吸一瞬间停了。",
      "cast": {
        "sprite": "ganshi",
        "x": 150,
        "y": 20
      }
    },
    {
      "say": "",
      "text": "墙上钉着的木衣架上，挂着一个十几岁的女孩。",
      "bg": "home",
      "palette": "night",
      "cast": {
        "sprite": "ganshi",
        "x": 150,
        "y": 20
      }
    },
    {
      "say": "",
      "text": "浅色中学制服皱成一团，弓着身，抱膝，面朝他。"
    },
    {
      "say": "",
      "text": "她在笑。脸上没有一丝血色，左嘴角干裂开来。"
    },
    {
      "say": "龙荻",
      "text": "（阴阳眼这破玩意儿……从没准时报过废。）"
    },
    {
      "say": "龙荻",
      "text": "（别动……只要我不动……她就不是真的……）"
    },
    {
      "say": "",
      "text": "屋里安静得能听见自己心跳，一下，一下。"
    },
    {
      "say": "",
      "text": "她慢慢张开双臂，舒展身子，放下两腿，站直了。"
    },
    {
      "say": "",
      "text": "头僵硬地左右晃，伴着血肉搅拌的黏腻声响。"
    },
    {
      "say": "",
      "text": "她费力把头从墙上移开——挂着的，是她自己的后脑勺。"
    },
    {
      "say": "",
      "text": "——咔。一声脆响，像枯枝折断。",
      "bg": "blank"
    },
    {
      "say": "龙荻",
      "text": "（卧槽……这回是真见鬼了。）",
      "bg": "home",
      "palette": "night"
    },
    {
      "say": "",
      "text": "她的脚没沾地，影子却拖了一路。"
    },
    {
      "say": "",
      "text": "她无声地滑到床边，停在了床头。",
      "bg": "home",
      "palette": "night",
      "cast": {
        "sprite": "ganshi",
        "x": 120,
        "y": 34
      }
    },
    {
      "say": "",
      "text": "一股冷气贴着他的脸，凉得像井底。"
    },
    {
      "say": "",
      "text": "她慢慢抬起右手，指着自己的左胸。",
      "bg": "home",
      "palette": "night",
      "cast": {
        "sprite": "ganshi",
        "x": 118,
        "y": 36
      }
    },
    {
      "say": "干尸女鬼",
      "text": "啊…啊…"
    },
    {
      "say": "",
      "text": "张开的嘴里一颗牙也没有，只剩腐烂干瘪的牙龈。"
    },
    {
      "say": "",
      "text": "他看清了她指尖按着的东西。"
    },
    {
      "say": "",
      "text": "一枚锈迹斑斑的胸牌。"
    },
    {
      "say": "",
      "text": "凑近看，锈层下隐约一行刻字。"
    },
    {
      "say": "",
      "text": "她那只枯手缓缓抬起，转而指向房间角落。"
    },
    {
      "say": "",
      "text": "那扇旧衣柜门，正被一阵无风的气流轻轻掀动。"
    },
    {
      "say": "",
      "text": "门缝里，丝丝黑气往外渗，深处黑得没有底。"
    },
    {
      "say": "龙荻",
      "text": "（她是要我……进那里面去？）"
    },
    {
      "say": "",
      "text": "锈迹被指尖一抹，露出底色。",
      "bg": "blank",
      "palette": "night"
    },
    {
      "say": "",
      "text": "上面刻着四个字：铃兰中学。",
      "end": true
    }
  ]
};

export const tunnel = {
  "id": "tunnel",
  "bg": "tunnel",
  "palette": "night",
  "cast": null,
  "next": "classroom",
  "script": [
    {
      "say": "",
      "text": "不知过了多久，他再次睁开眼。",
      "bg": "home",
      "palette": "night",
      "cast": {
        "sprite": "ganshi",
        "x": 110,
        "y": 28
      }
    },
    {
      "say": "",
      "text": "室内一片昏暗，空气黏得像化不开的糖浆。"
    },
    {
      "say": "",
      "text": "她跪坐在他双腿上，直勾勾地盯着他。"
    },
    {
      "say": "",
      "text": "枯瘦的脸近在咫尺，呼吸里全是陈年尘土味。"
    },
    {
      "say": "",
      "text": "她近得能数清眼里的裂纹，却没有眼神。",
      "bg": "blank"
    },
    {
      "say": "龙荻",
      "text": "（喊不出来……我连一根手指都动不了。）",
      "bg": "home"
    },
    {
      "say": "",
      "text": "她歪着头看了他很久，慢慢爬下来。",
      "bg": "home",
      "palette": "night",
      "cast": {
        "sprite": "ganshi",
        "x": 150,
        "y": 34
      }
    },
    {
      "say": "",
      "text": "枯瘦的手指立在他脸边，朝门口点了点。",
      "cast": {
        "sprite": "ganshi",
        "x": 165,
        "y": 32
      }
    },
    {
      "say": "",
      "text": "门口黑着，像在等他。"
    },
    {
      "choice": "他的身体不听使唤，自己坐了起来——",
      "options": [
        {
          "label": "跟上去",
          "goto": "follow"
        },
        {
          "label": "拼命想留住自己",
          "goto": "resist"
        }
      ]
    },
    {
      "id": "resist",
      "say": "",
      "text": "他攥紧床单，指节发白——身体却已自己坐起。"
    },
    {
      "id": "follow",
      "say": "龙荻",
      "text": "（像被人提着线，腿自己在走。）"
    },
    {
      "say": "",
      "text": "她把他领到衣橱前，缓缓抬起了手。",
      "bg": "home",
      "palette": "night",
      "cast": {
        "sprite": "ganshi",
        "x": 175,
        "y": 30
      }
    },
    {
      "say": "",
      "text": "柜门开了。衣服没了，里头是一条悠长的隧道。",
      "bg": "tunnel",
      "palette": "night",
      "cast": {
        "sprite": "ganshi",
        "x": 180,
        "y": 30
      }
    },
    {
      "say": "",
      "text": "墙上每隔很远一盏昏黄小灯，尽头透着微光。"
    },
    {
      "say": "",
      "text": "隧道里没有回声，他的脚步像踩进棉花。"
    },
    {
      "say": "",
      "text": "灯一盏盏朝里缩去，像谁眨着眼引他往深处走。"
    },
    {
      "say": "",
      "text": "她偏过头，指尖朝那片光轻轻一引。",
      "cast": {
        "sprite": "ganshi",
        "x": 60,
        "y": 34
      }
    },
    {
      "say": "",
      "text": "他迈进隧道，脚下一空，墙壁的灯飞速倒退。",
      "bg": "tunnel",
      "palette": "night",
      "cast": null
    },
    {
      "say": "龙荻",
      "text": "（耳朵嗡的一声，像被整个吸了进去。）"
    },
    {
      "say": "",
      "text": "失重感散去，那片光里浮出一排排课桌。",
      "bg": "classroom",
      "palette": "night",
      "cast": null
    },
    {
      "say": "龙荻",
      "text": "（去吧。反正……我也没得选。）",
      "end": true
    }
  ]
};

export const classroom = {
  "id": "classroom",
  "bg": "classroom",
  "palette": "day",
  "cast": {
    "sprite": "dongxiaoli",
    "x": 196,
    "y": 20
  },
  "next": "ch2_class",
  "script": [
    {
      "say": "",
      "text": "一阵刺眼的白光，像把整条隧道烧穿了。",
      "bg": "blank",
      "palette": "day",
      "cast": null
    },
    {
      "say": "",
      "text": "白光退去，空气里浮起细细的粉笔灰。",
      "bg": "classroom",
      "palette": "day",
      "cast": null
    },
    {
      "say": "",
      "text": "脚下不再是潮湿的木板，是冰凉的水磨石。"
    },
    {
      "say": "",
      "text": "龙荻睁开眼，整个人僵在原地。"
    },
    {
      "say": "",
      "text": "午后的阳光斜斜照进来，暖得不像话。"
    },
    {
      "say": "",
      "text": "阳光、粉笔灰、宽敞明亮的教室——一排排课桌。"
    },
    {
      "say": "",
      "text": "吊扇懒懒地转，把蝉鸣搅进闷热的空气。"
    },
    {
      "say": "",
      "text": "座位上，全是他记忆深处熟悉的脸。"
    },
    {
      "say": "龙荻",
      "text": "（这些脸……全是我高中同学，早过去十几年了……）"
    },
    {
      "say": "龙荻",
      "text": "（怎么一个个，都还这么年轻……）"
    },
    {
      "say": "",
      "text": "讲台上，一道熟悉的身影抬起头。"
    },
    {
      "say": "张红老师",
      "text": "龙荻，你又迟到，赶快坐着，每次都这样。"
    },
    {
      "say": "龙荻",
      "text": "（张红老师……她笑得跟当年一模一样。）"
    },
    {
      "say": "龙荻",
      "text": "（可她坟头的草，我都拔过两回了啊。）"
    },
    {
      "say": "",
      "text": "吊扇还在转，蝉鸣灌满了耳朵。"
    },
    {
      "say": "",
      "text": "他猛地回头——女鬼没了，隧道也没了。"
    },
    {
      "say": "",
      "text": "身后只剩一整面窗，和满室晃眼的白。",
      "bg": "blank"
    },
    {
      "choice": "身后那个座位上，有人在轻轻笑——",
      "bg": "classroom",
      "options": [
        {
          "label": "回头，看清那张脸",
          "goto": "meet"
        },
        {
          "label": "先低头，不敢看",
          "goto": "lower"
        }
      ]
    },
    {
      "id": "lower",
      "say": "龙荻",
      "text": "（我低下头……可那笑声就在耳边。）",
      "bg": "classroom",
      "cast": null
    },
    {
      "say": "",
      "text": "后颈一阵发麻，那笑声越凑越近。"
    },
    {
      "say": "龙荻",
      "text": "（软软的，黏在后颈上，躲也躲不开。）"
    },
    {
      "say": "",
      "text": "他还是慢慢，回过了头。"
    },
    {
      "id": "meet",
      "say": "",
      "text": "一个美丽的女孩，正笑盈盈地看着他。",
      "cast": {
        "sprite": "dongxiaoli",
        "x": 150,
        "y": 24
      }
    },
    {
      "say": "董晓丽",
      "text": "龙荻，你快坐下，都挡着我了。"
    },
    {
      "say": "",
      "text": "蓝白的运动校服，阳光落在她肩上。"
    },
    {
      "say": "",
      "text": "睫毛很长，眼睛亮得像盛了一汪水。"
    },
    {
      "say": "",
      "text": "他的视线，不由自主落到她胸前。"
    },
    {
      "say": "",
      "text": "胸前名牌——「铃兰高中」，亮得刺眼。"
    },
    {
      "say": "龙荻",
      "text": "（董晓丽……高二转来的那个转学生。）"
    },
    {
      "say": "龙荻",
      "text": "（这名字，这张脸，我怎么会忘。）"
    },
    {
      "say": "龙荻",
      "text": "（不对……这一切，我十七岁那年才有。）"
    },
    {
      "say": "龙荻",
      "text": "（可越是熟悉，心里就越发冷。）"
    },
    {
      "say": "龙荻",
      "text": "（这地方……到底哪里不太对劲。）"
    },
    {
      "say": "",
      "text": "他懂了。他真的，重返十七岁了。",
      "end": true
    }
  ]
};

