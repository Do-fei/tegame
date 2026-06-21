// 故事索引：所有场景 + 起点。加章节就在这里登记。
import { office, booth, proend } from './prologue.js';
import { camera, tongtong, email } from './prologue_extra.js';
import { bedroom, tunnel, classroom } from './chapter1.js';
import { ch2_class, ch2_yard, ch2_diner, ch2_guitongzi } from './chapter2.js';
import { ch3_outing, ch3_bus, ch3_crash, ch3_hospital } from './chapter3.js';
import { mem_milkshake, mem_fight, mem_birthday } from './memories.js';
import { rev1_photo, rev1_truth, rev1_return } from './rev1.js';
import { ch4_tang, ch4_orlando, ch4_dafei, ch4_laojin } from './chapter4.js';
import { ch5_arrive, ch5_room201, ch5_boss, ch5_omen } from './chapter5.js';
import { rev2_invade, rev2_youtian, rev2_battle, fin_reverse, fin_reunion } from './finale.js';
import { cafe } from './cafe.js';

export const SCENES = {
  [office.id]: office,
  [booth.id]: booth,
  [camera.id]: camera,
  [tongtong.id]: tongtong,
  [email.id]: email,
  [proend.id]: proend,
  [bedroom.id]: bedroom,
  [tunnel.id]: tunnel,
  [classroom.id]: classroom,
  [ch2_class.id]: ch2_class,
  [ch2_yard.id]: ch2_yard,
  [ch2_diner.id]: ch2_diner,
  [ch2_guitongzi.id]: ch2_guitongzi,
  [ch3_outing.id]: ch3_outing,
  [ch3_bus.id]: ch3_bus,
  [ch3_crash.id]: ch3_crash,
  [ch3_hospital.id]: ch3_hospital,
  [mem_milkshake.id]: mem_milkshake,
  [mem_fight.id]: mem_fight,
  [mem_birthday.id]: mem_birthday,
  [rev1_photo.id]: rev1_photo,
  [rev1_truth.id]: rev1_truth,
  [rev1_return.id]: rev1_return,
  [ch4_tang.id]: ch4_tang,
  [ch4_orlando.id]: ch4_orlando,
  [ch4_dafei.id]: ch4_dafei,
  [ch4_laojin.id]: ch4_laojin,
  [ch5_arrive.id]: ch5_arrive,
  [ch5_room201.id]: ch5_room201,
  [ch5_boss.id]: ch5_boss,
  [ch5_omen.id]: ch5_omen,
  [rev2_invade.id]: rev2_invade,
  [rev2_youtian.id]: rev2_youtian,
  [rev2_battle.id]: rev2_battle,
  [fin_reverse.id]: fin_reverse,
  [fin_reunion.id]: fin_reunion,
  [cafe.id]: cafe,
};

export const START = 'office';
