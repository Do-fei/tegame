// 序章前段：office / booth / proend —— 舞台加厚已落地（换景/走位/立绘登场/色板/演出拍；结构经程序校验未改动，node 生成）。

export const office = {
  "id": "office",
  "bg": "office",
  "palette": "night",
  "cast": null,
  "next": "booth",
  "script": [
    {
      "say": "",
      "text": "LoveKid 创业公司 · 凌晨 2:45。"
    },
    {
      "say": "",
      "text": "整层写字楼黑成一片，只剩我工位这一盏灯。"
    },
    {
      "say": "",
      "text": "空调嗡嗡地吹，吹得人后颈发凉。"
    },
    {
      "say": "龙荻",
      "text": "（揉了揉发酸的脖子）……又是这个点啊。",
      "cast": {
        "sprite": "longdi",
        "x": 110,
        "y": 32
      }
    },
    {
      "say": "龙荻",
      "text": "（屏幕的光打在脸上，键盘声在空楼里格外响。）"
    },
    {
      "say": "龙荻",
      "text": "回完最后一封邮件，起身打了杯水。"
    },
    {
      "say": "",
      "text": "饮水机咕嘟一声，在空楼里荡出回响。"
    },
    {
      "say": "龙荻",
      "text": "饮水机咕嘟一声，吓了我一跳——这楼也太静了。"
    },
    {
      "say": "龙荻",
      "text": "老板办公室的灯还亮着。"
    },
    {
      "say": "龙荻",
      "text": "有这样的老板，我们怎么好意思不拼。"
    },
    {
      "say": "龙荻",
      "text": "可整层就我俩亮灯，越看越觉得空得不对劲。"
    },
    {
      "say": "",
      "text": "那扇门缝里的灯，一动不动地亮着。"
    },
    {
      "say": "龙荻",
      "text": "行了，收拾收拾回家。"
    },
    {
      "say": "龙荻",
      "text": "明天还说好陪我妈逛街呢，别让她等。"
    },
    {
      "say": "",
      "text": "工位的光一灭，整层楼彻底沉进黑里。",
      "bg": "blank",
      "palette": "night",
      "cast": null
    },
    {
      "say": "",
      "text": "眼睛还没适应，只听见自己的呼吸。"
    },
    {
      "say": "龙荻",
      "text": "（叫好了专车，得下楼，从大厦正门出去。）"
    },
    {
      "say": "",
      "text": "电梯门合上，楼层数字一格格往下掉。",
      "bg": "blank",
      "palette": "night"
    },
    {
      "say": "",
      "text": "数字越跳越低，像往什么地方沉下去。"
    },
    {
      "say": "",
      "text": "我关掉电脑，叫好专车，走进电梯，按下一楼。",
      "end": true
    }
  ]
};

export const booth = {
  "id": "booth",
  "bg": "booth",
  "palette": "night",
  "cast": {
    "sprite": "lvyi",
    "x": 132,
    "y": 34
  },
  "next": "camera",
  "script": [
    {
      "say": "",
      "text": "电梯门一开，一楼大堂空荡荡的。",
      "bg": "booth",
      "palette": "day",
      "cast": null
    },
    {
      "say": "",
      "text": "夜里十一点多，只剩感应灯冷白地亮着。"
    },
    {
      "say": "",
      "text": "脚步声在大理石上敲出回音，格外清楚。"
    },
    {
      "say": "",
      "text": "那回音，好像比我的脚步慢了半拍。"
    },
    {
      "say": "龙荻",
      "text": "（终于下班了，老腰都快坐断了。）"
    },
    {
      "say": "",
      "text": "走到大门口，玻璃门外是浓得化不开的夜。"
    },
    {
      "say": "",
      "text": "保安亭里，坐着一个人。",
      "cast": {
        "sprite": "lvyi",
        "x": 132,
        "y": 34
      }
    },
    {
      "say": "龙荻",
      "text": "……不是平时那个憨憨的小胖保安。"
    },
    {
      "say": "龙荻",
      "text": "是个女孩子，长头发，穿青绿色的衣服。"
    },
    {
      "say": "",
      "text": "她背挺得笔直，像谁把她摆在那儿。"
    },
    {
      "say": "龙荻",
      "text": "（哈，这八成是小保安的女朋友吧。）"
    },
    {
      "say": "龙荻",
      "text": "（他准是又溜到楼后抽烟去了。）"
    },
    {
      "say": "",
      "text": "我没多想，推门出去。夜风一吹，凉得扎人。",
      "cast": null
    },
    {
      "say": "",
      "text": "玻璃门在身后合上，把那点灯光也关进去了。"
    },
    {
      "say": "",
      "text": "我上了车。车子启动的一瞬间——",
      "bg": "blank",
      "cast": null
    },
    {
      "say": "",
      "text": "我又往保安亭那边看了一眼。"
    },
    {
      "say": "",
      "text": "亭里的灯惨白惨白，把她照得没一点血色。",
      "bg": "booth",
      "palette": "night",
      "cast": {
        "sprite": "lvyi",
        "x": 140,
        "y": 36
      }
    },
    {
      "say": "",
      "text": "那个女孩，还是抬着头，盯着正前方。"
    },
    {
      "say": "",
      "text": "一动，也不动。"
    },
    {
      "say": "",
      "text": "车灯扫过，她的影子却没跟着动。"
    },
    {
      "say": "龙荻",
      "text": "（眼睛眨都不眨……正常人能那么坐着？）"
    },
    {
      "say": "龙荻",
      "text": "……（莫名地，后背窜起一阵凉。）师傅，走吧。",
      "end": true
    }
  ]
};

export const proend = {
  "id": "proend",
  "bg": "blank",
  "palette": "night",
  "cast": null,
  "next": "bedroom",
  "script": [
    {
      "say": "",
      "text": "笔记本合上，房间里只剩自己的呼吸声。",
      "bg": "home",
      "palette": "night",
      "cast": null
    },
    {
      "say": "",
      "text": "手机还烫着，邮件的字一行行隐没在暗下去的屏里。"
    },
    {
      "say": "",
      "text": "屏幕灭了，黑玻璃里浮出他自己的脸。",
      "bg": "blank",
      "palette": "night"
    },
    {
      "say": "龙荻",
      "text": "（……这门，刚才是不是没声响。）",
      "bg": "home",
      "palette": "night",
      "cast": {
        "sprite": "longdi",
        "x": 120,
        "y": 30
      }
    },
    {
      "say": "",
      "text": "窗外没有月亮，夜静得像被谁掐住了喉咙。"
    },
    {
      "say": "",
      "text": "—— 序章 · 完 ——",
      "bg": "blank",
      "palette": "night",
      "cast": null
    },
    {
      "say": "",
      "text": "某种凉意，正从墙壁那头悄悄渗过来。",
      "bg": "home",
      "palette": "night",
      "cast": null
    },
    {
      "say": "",
      "text": "仿佛有谁，正贴着墙，听他喘气。"
    },
    {
      "say": "",
      "text": "墙的那一头，极轻地，响了一下。"
    },
    {
      "say": "",
      "text": "第一章 · 墙上的她",
      "end": true
    }
  ]
};

