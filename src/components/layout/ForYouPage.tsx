"use client";

import React, { useState, useEffect } from "react";
import { Heart, ChevronLeft, ChevronRight, Sparkles, Lock, MailOpen, ArrowLeft } from "lucide-react";
import { Playfair_Display, Tangerine } from "next/font/google";
import { useLoading } from '@/components/providers/LoadingProvider';

// Elegant fonts for the letter
const playfair = Playfair_Display({ 
  subsets: ["latin"], 
  weight: ["400", "500", "600", "700"],
  style: ["normal", "italic"]
});

const tangerine = Tangerine({
  subsets: ["latin"],
  weight: ["400", "700"],
});

interface Letter {
  id: number;
  title: string;
  description: string;
  pages: string[];
}

export default function ForYouPage() {
  const { isAuthorized, setIsAuthorized, lock } = useLoading();
  const [selectedLetterId, setSelectedLetterId] = useState<number | null>(null);
  const [isHovering, setIsHovering] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showText, setShowText] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [stars, setStars] = useState<{ id: number; left: string; top: string; delay: string; duration: string }[]>([]);

  const letters: Letter[] = [
    {
      id: 1,
      title: "จดหมายจากพี่แชมป์",
      description: "ความรู้สึกจากพี่ถึงน้อง",
      pages: [
        `ถึงน้องรักของพี่

ไม่นึกเหมือนกันนะ ว่าผู้ชายแบบพี่จะต้องมาเขียนอะไรแบบนี้ 
เพราะแทบไม่เคยคิดว่าจะมีสังคม มีเพื่อน จากการทำงานเลย ที่สนิทมากๆขนาดนี้
รวมถึงแม้งานดีดีก็ไม่เคยคิดอยู่ในหัวเลย จนวันนึงที่นี้ได้ให้โอกาส บอกตามตรง ชีวิตเปลี่ยนเลยแหละ

จนวันที่น้องเข้ามา 2 ตุลา ใช่แหละ บอกเลยพี่ตื่นเต้นนะ จะมีสาวเข้าทีมแล้ว (หวังให้เค้ามาแบก555) 
ทีมเราใหญ่ขึ้นจริง tester 4 คนเยอะกว่าบางบริษัทอีกนะ มาแรกๆบอกเลยพี่ไม่กล้าคุยด้วยครับ 
เพราะผมก็ขี้อาย เขินสาว มีอะไรฝากโมไปคุยไปถามด้วยนั่นละ ก็ทำไปเรื่อยๆจำไม่ได้ 
เริ่มคุยไรกันจำได้แค่ใช้ร่างแชมป์คนดี จนน้องแซวว่าร่างนั้นหายไปไหนแล้ว

จนเริ่มทำโปรเจ็ค PCU ก็ได้ลงไปทำงานกันชั้นลอย จำไม่ได้ว่าพี่กับเองลงไปด้วยกันก่อนไหม 
ทำให้ช่วงนั้นก็เริ่มสนิทกันมากขึ้น จนได้เริ่มตรวจเทสงานกัน สมัยนั้นก็ขยันกันมาก 
พี่ก็ไฟแรง น้องก็ขยันเกิ้น เลิกงานกลับบ้านก็ทำงานกันต่อ (จนทุกวันนี้ก็ยังทำ555) 
เป็นพวกอยากจบงานไม่อยากค้างคา (มีน้องสไตล์เดียวกันชอบเลย มีเพื่อนทำงานด้วย) 

พอมาช่วงโมออก เราเหลือกันสองคนคือเราก็ยังแบกกันได้อยู่นะ ทั้งของทีมตัวเองและช่วยทีมอื่น 
ช่วงนั้นเราก็เข้าขากันเรื่อยๆ ตั้งแต่เรื่องงานจนถึงนินทาชาวบ้าน555 
จนแบบเคยมีความคิดที่ถ้าที่นี้เงินดี สวัสดี น้องอยู่พี่ก็อยู่ อยากทำกับน้องไปตลอด 
เหมือนเจอคู่หูไปแล้วอะ เรื่องบางเรื่องผลัดกันช่วย น้องทำได้พี่ขอให้ช่วย อันไหนพี่ทำได้พี่ก็เสนอตัว

บอกตามตรงน้อยคนนะที่ทำงานแล้วจะเจอคนแบบนี้ เพราะคนส่วนใหญ่เค้าจะจบในเวลางาน 
ไม่มานั่งทำไรกันต่อ พี่อยากรักษาเด็กคนนี้ไว้ เค้าใส่ใจทั้งงาน 
ใส่ใจผมและงานรอบโต๊ะ (ขอโทษ)`,
        `วันที่ผมก็ป่วยหนัก ป่วยจนคิดว่าคงไม่รอดอะ ผมเห็นเลือดยังกลัวเลย ทรมานทุกครั้ง 
ขอบคุณน้องที่เป็นห่วง ขอบคุณที่มาเยี่ยมนั่งรอจนหมดเวลา คอยถามอาการ 
คอยด่าจนโรคมันสำนึกหายไป555 ช่วงนั้นน้องต้องมารับงานแทนพี่อีก 
ขอบคุณที่รับดูแลงานแทนพี่นะ รู้ว่าน้องเหนื่อย เลยอยากซื้ออะไรให้
สรุปตอนนั้นเห็นน้องชอบหนาว เลยเลือกผ้าห่มคลุมตัว (ฝากดูแลน้องด้วย)

หลังจากหายได้กลับมานั่งทำงาน ได้เจอน้องผมสักทีคือคิดถึงน้องและคิดถึงคำแซะอะ 
ขาดกำลังใจในการใชัชีวิต กลับมาคนอื่นก็ออกไปเกือบหมดละ นั่งเหงากันยกชั้น
เหลือกันสองคนพี่น้อง สุดท้ายกลับมาโดนแยกโปรเจ็คอีก พี่เลยขอเลือกเดนทอล 
ให้น้องไปทำ pcu ต่อเพราะคิดว่าน้องผมเก่งกว่า ละเอียดรอบครอบกว่า 
พี่เป็นที่ปรึกษาให้น้องเอาดีกว่า

พอแยกกันทำแล้วพี่รู้สึกเหงามาก ทั้งตอนน้องลงไปประชุม หรือเราต้องไป 
มันเหมือนขาดคู่หูไปอะ ยิ่งปลายปี เค้าไปเข้าบริษัทอารีย์กันบ่อย (แถมปีใหม่อีก 3 วัน) 
เราก็เหงา บอกเลยคิดถึงมากกกก 

ช่วงที่พี่รู้สึกเราสนิทกันมากขึ้นอีกก็คงช่วงปลายปี ที่น้องไปกินข้าวด้วยเลย 
ขอบคุณคนละครึ่งนายกหนูมากครับ55555555 มีความสุขมาก 
ถึงแม้จะไม่ค่อยพูดอะไรบนโต๊ะ คุยแต่งานกับนินทาชาวบ้าน555 
อาหารอร่อยบ้างไม่อร่อยบ้าง แต่มีน้องตรงหน้าพอชดเชยได้อยู่

พี่นึกได้ช่วงหนึ่ง น้องชวนไปดูคอนเสิร์ตที่ one Bangkok บอกเลยนะในใจโคตรอยากไป 
แต่น้องก็รู้นะพี่ติดไปไม่ได้เพราะอะไร (เศร้า) ไว้ไปด้วยกันสักรอบนะ
`,
        `วันที่พี่ใจพี่หล่นไปตาตุ่ม ก็มาแบบไม่ทันตั้งตัว จำได้เลย 9 ก.พ. 69 เราก็เดินไปยืนส่งน้องขึ้นรถไฟ 
สายพี่แยมโทรบอกน้องว่าตกลงรับเข้าทำงานนะ ตอนนั้นพี่ช็อคมาก มันไวจนตั้งตัวไม่ทัน 
เพราะรู้เลยน้องต้องยื่นออกแล้ว เราจะเหลือเวลากับเค้าไม่เกิน 30 วันแล้ว 
ทำอะไรไม่ถูก น้ำตาแทบจะไหลตรงนั้นเลย

ซึ่งมันเป็นเพราะตัวพี่เองด้วยที่ทำได้ไม่ดีเอง ไม่เต็มที่ จัดการตัวเองไม่ได้ 
แถมช่วงตั้งแต่หายป่วยมาก็นอนไม่ค่อยเต็มที่อยู่แล้ว เอ๋อๆไปบ้าง เลยเป็นเหตุหนึ่งที่เราต้องแยกกัน 
พี่ดีใจด้วยนะน้องที่น้องได้เติบโตไปอีกขั้น ได้งานทันเวลาที่อยากเปลี่ยนพอดี 
แต่พี่เชื่อว่าตอนนั้นเราเลือกสิ่งที่ดีสุดให้ตัวเองแล้ว (ถึงแม้ตอนนี้จะเสียดายก็เถอะ)`,
        `อยากขอโทษ...
เริ่มจากคำพูดเลย พี่อาจจะพิมคำหยาบใส่น้อง ไม่ว่าจะพิมด่าจากเรื่องอื่นๆ หรือพูดให้น้องได้ยิน 
ไม่มีใครชอบแน่ๆ ขอโทษจริงๆครับ หรือแซะน้อง (อันนี้ขำขำนะ ที่แซวเพราะอยากคุยด้วยอยากแกล้งเล่น)

การกระทำ ไม่ว่าจะตั้งใจหรือไม่ตั้งใจ ตั้งแต่ช่วงที่น้องกับพี่งอนกันตอนที่ทำงาน 3-4 รอบเลย 
หรือเรื่องที่แรงสุดก็คงเรื่องที่ทีม PCU โทรมาชวนกินหมูกะทะ แล้วพี่ก็น้อยใจ 
คือเป็นอะไรที่แย่สุดตั้งแต่เราอยู่ด้วยกัน

เรื่องน้อยใจบ่อย คือหลังจากพอแยกโปรเจ็คพี่รู้สึก น้อยใจบ่อยมาก ทั้งต้องทำงานคนเดียว 
เห็นน้องได้ทำกับทีม ไปไหนด้วยกัน แถมคิดถึงด้วย มันก็เลยแสดงการกระทำแบบนั้นออกมา
ขอโทษที่บางช่วง อาจจะช่วยน้องได้น้อย พี่รู้ว่างานน้องหนักจริง เครียดด้วย 
รู้นะว่าแอบร้องไห้ น้องเซฟความรู้สึกตัวเองดีแล้วครับ รักตัวเองดีแล้วนะ
`,
        `อยากขอบคุณ...
ขอบคุณน้องพี่ที่เสียสละตัวเอง ความทุ่มเท ทั้งเรื่องงาน เรื่องข้างนอก 
ขอบคุณที่ไว้ใจทีมไว้ใจพี่ในการสอนช่วยกันติวช่วยกันหาความรู้ จนเราผ่านมันไปได้ 
มองย้อนไปเราทั่งคู่เก่งขึ้นเยอะจากวันแรก

ขอบคุณที่เป็นน้องที่ดี เพื่อนร่วมงานที่ดี เป็นลูกศิษย์ เป็นเพื่อนข้างนอก 
เป็นคนมาช่วยงาน ช่วยคุยแก้เหงา แถมยังเป็นคนมาช่วยกันกดช็อปปี้ให้ด้วยอีกกก (ไม่คิดจริงๆ555)

ขอบคุณพ่อแม่เทอนะ ที่สอนลูกเค้าคนนี้มาอย่างดี ทั้งเรื่องการใช้ชีวิต 
ความคิด การกระทำต่างๆ ช่วยเตือนพี่ไม่ให้พูดไม่ดี พี่ภูมิใจกับเรามากเลย

ขอบคุณที่ให้ไปส่ง ไปยืนส่งขึ้นรถไฟ ให้ไปส่งใกล้ๆบ้าน 
การที่ได้ดูแลเทอ มันคือความสุขเล็กๆของพี่
ขอบคุณที่พาไปเที่ยวนะ เป็นวันที่พี่โคตรมีความสุขมากๆเลยอะ 
ได้ไปกับคนที่เราอยากไป เหนื่อยเท่าไรก็สู้ ไม่รู้น้องรู้สึกยังไง ขอโทษที่พาไปลำบากนะ

ขอบคุณคุณที่เป็นแพรวที่ดีเสมอมา แพรวที่มีพลังงานล้นๆ แพรวที่น่ารักสำหรับพี่ 
ขอบคุณรอยยิ้มของเทอนะ ที่ทำให้วันจันของพี่สดใสเสมอ 
เองทำให้พี่อยากไปทำงานทุกวันเลยอะ อยากเก่ง อยากมีอะไรมาสอนน้อง`,
        `ทำไมต้องเป็นเทอ...
ก่อนอื่นต้องขอโทษน้องนะ ที่พี่มีความรู้สึกดีๆให้เกิน คำว่าพี่น้องไป 
แถมอยู่ในจังหวะที่สถานะไม่โอเคด้วย (ขอโทษจริงๆ) 
พี่อึดอัดเลยคิดว่าการบอกให้น้องรับรู้ดีกว่าเก็บเอาไว้ วันนั้นเลยทำแบบนั้นออกไป

จากที่ได้อยู่ด้วยกัน รู้นิสัยใจคอกันประมาณนึงและเป็น พี่หลงรักในตัวน้องจริงๆ 
เทอคือ คนที่พี่อยู่ด้วยแล้วสบายใจ ในหลายๆด้าน ชอบในความเก่ง ชอบในความน่ารัก 
ยิ่งนั่งมองทุกวันก็หลงเข้าไปอีก พี่รู้สึกดีกับน้องมาสักพักแล้วตั้งแต่ช่วงปลายปี

สำหรับตอนนี้ เรายังคุยกันได้เหมือนเดิมแบบพี่น้องที่อาจจะมากกว่าคนอื่นหน่อย 
แต่น้องไม่ต้องอึดอัดนะ พี่ยังเป็นพี่ที่ดีของน้องได้เสมอ คอยอยู่ซัพพอร์ตเราตลอดในทุกๆเรื่อง
ตอนนี้พี่เคารพในการตัดสินใจของน้องเพราะน้องก็มีคนของน้องอยู่ 
พี่อยากจะบอกว่าวันไหนที่น้องเริ่มต้นใหม่อีกครั้ง พี่อยากจะขอโอกาสนั้นได้ไหม...พี่รอได้นะ

ส่วนทางพี่ก็คิดว่าไม่นานก็คงออกมาอยู่คนเดียวดีกว่า พี่คิดว่าความคิด ความเข้าใจ ไม่เหมือนกันเลย 
คิดคนละแบบ คงไปด้วยกันไม่ได้จริงๆ ขอรักตัวเองบ้าง`,
        `สุดท้ายนี้...
พี่ยินดีกับการเดินทางครั้งใหม่ของน้องนะ ขอให้เจอที่ทำงานดีดี เจอเพื่อนดีดี 
เจอหัวหน้าที่ดี พัฒนาตัวเอง เก็บความรู้ประสบการณ์มาให้เยอะๆ
พี่ยินดีกับทุกความสำเร็จ ฝากสู้ต่อด้วยนะ ฝากความฝันของพี่เอาไปด้วย 
น้องไปได้ไกลกว่าพี่ เองยังอายุน้อยและพี่เชื่อว่าน้องพี่ทำได้

ไม่ว่าจะเจอปัญหาอะไร อุปสรรคยังไง ขอให้เองผ่านไปได้เสมอ 
ใครดีก็ดีด้วย ใครไม่ดีก็ปล่อยผ่านไปทำหน้าที่ของเรา สิ้นปีก็จบแล้ว ค่อยคิดการเดินทางใหม่
เป็น 2 ปีกว่าๆ ที่ดีมากจริงๆ ดีใจมากนะที่ช่วงเวลาหนึ่งได้ทำงานด้วยกัน 
ขอบคุณที่เป็นรอยยิ้มและพลังบวกให้พี่เสมอมา พี่ยังคงคิดถึงน้องอยู่ทุกวันแน่ๆ

มีเรื่องอะไร มาบอกมาเล่าได้นะ ไม่ว่าจะงาน ครอบครัว ส่วนตัว พี่รับฟังได้เสมอ 
ทักมาหากันบ่อยๆนะ อยู่คนละที่ก็นินทาได้ อย่างที่บอกถ้าพี่ทำตัวไม่ดีตอนเราห่างกันแบบนี้ 
ให้อภัยพี่ด้วยนะ ถ้าเหงาๆหาคนไปกินหรือไปไหนด้วย ชวนได้นะ มีอะไรด่วนโทรได้เลยนะ 
พี่พร้อมเป็นคนแรกๆต่อจากคนที่บ้านของน้องถ้าเองนึกถึงและโทรมาได้เสมอ

พี่ยังทัก ยังชวนคุยอยู่นะ อย่าพึ่งเบื่อกันละ พี่จะทำให้ดูนะว่าจะไม่หายไปไหน 
ของที่ซื้อให้แล้วหรือจะซื้อให้อีกไม่ต้องเกรงใจนะ พี่ตั้งใจทำ ตั้งใจให้ 
ทุกอย่างคือความสุขของพี่ ขอให้เก็บความน่ารักแบบนี้ไว้ตลอดไปนะ 
(แต่อย่าไปใช้กับคนอื่นเยอะพี่หึง) 

รักและเป็นห่วงเองนะ ❤️
`
      ]
    },
    {
      id: 2,
      title: "\u0e08\u0e14\u0e2b\u0e21\u0e32\u0e22\u0e08\u0e32\u0e01\u0e19\u0e49\u0e2d\u0e07\u0e41\u0e1e\u0e23\u0e27",
      description: "\u0e04\u0e27\u0e32\u0e21\u0e23\u0e39\u0e49\u0e2a\u0e36\u0e01\u0e08\u0e32\u0e01\u0e19\u0e49\u0e2d\u0e07\u0e16\u0e36\u0e07\u0e1e\u0e35\u0e48\u0e0a\u0e32\u0e22",
      pages: [
        `\u0e16\u0e36\u0e07 \u0e1e\u0e35\u0e48\u0e0a\u0e32\u0e22\u0e02\u0e2d\u0e07\u0e19\u0e49\u0e2d\u0e07\u0e41\u0e1e\u0e23\u0e27

\u0e19\u0e49\u0e2d\u0e07\u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e17\u0e38\u0e01\u0e2d\u0e22\u0e48\u0e32\u0e07 \u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e17\u0e35\u0e48\u0e04\u0e2d\u0e22\u0e2a\u0e2d\u0e19\u0e07\u0e32\u0e19 \u0e15\u0e31\u0e49\u0e07\u0e41\u0e15\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e40\u0e02\u0e49\u0e32\u0e21\u0e32\u0e08\u0e19\u0e16\u0e36\u0e07\u0e17\u0e38\u0e01\u0e27\u0e31\u0e19\u0e19\u0e35\u0e49 
\u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e17\u0e35\u0e48\u0e1e\u0e22\u0e32\u0e22\u0e32\u0e21\u0e2b\u0e32\u0e40\u0e27\u0e25\u0e32\u0e21\u0e32\u0e2a\u0e2d\u0e19 \u0e02\u0e2d\u0e42\u0e17\u0e29\u0e17\u0e35\u0e48\u0e23\u0e1a\u0e01\u0e27\u0e19\u0e19\u0e49\u0e2d\u0e07\u0e23\u0e39\u0e49\u0e27\u0e48\u0e32\u0e1e\u0e35\u0e48\u0e04\u0e07\u0e2d\u0e22\u0e32\u0e01\u0e1e\u0e31\u0e01 
\u0e41\u0e15\u0e48\u0e2b\u0e19\u0e39\u0e01\u0e47\u0e15\u0e37\u0e49\u0e2d\u0e43\u0e2b\u0e49\u0e2a\u0e2d\u0e19\u0e19\u0e31\u0e48\u0e19\u0e19\u0e35\u0e48\u0e15\u0e25\u0e2d\u0e14\u0e40\u0e27\u0e25\u0e32 \u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e02\u0e49\u0e32\u0e07\u0e46\u0e19\u0e49\u0e2d\u0e07\u0e15\u0e25\u0e2d\u0e14\u0e40\u0e27\u0e25\u0e32\u0e43\u0e19\u0e01\u0e32\u0e23\u0e17\u0e33\u0e07\u0e32\u0e19 
\u0e17\u0e38\u0e01\u0e1b\u0e31\u0e0d\u0e2b\u0e32\u0e08\u0e30\u0e21\u0e35\u0e19\u0e49\u0e2d\u0e07\u0e41\u0e25\u0e30\u0e1e\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e40\u0e2a\u0e21\u0e2d555 \u0e17\u0e38\u0e01\u0e1b\u0e31\u0e0d\u0e2b\u0e32\u0e17\u0e35\u0e48\u0e1c\u0e48\u0e32\u0e19\u0e44\u0e1b\u0e44\u0e14\u0e49\u0e40\u0e1e\u0e23\u0e32\u0e30\u0e21\u0e35\u0e1e\u0e35\u0e48\u0e04\u0e2d\u0e22\u0e0a\u0e48\u0e27\u0e22\u0e40\u0e2a\u0e21\u0e2d 
\u0e17\u0e31\u0e49\u0e07\u0e0a\u0e48\u0e27\u0e22\u0e17\u0e33\u0e41\u0e25\u0e30\u0e0a\u0e48\u0e27\u0e22\u0e43\u0e2b\u0e49\u0e01\u0e33\u0e25\u0e31\u0e07\u0e43\u0e08

\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e19\u0e49\u0e2d\u0e07\u0e43\u0e19\u0e01\u0e32\u0e23\u0e17\u0e33\u0e07\u0e32\u0e19\u0e44\u0e21\u0e48\u0e27\u0e48\u0e32\u0e08\u0e30\u0e22\u0e32\u0e01\u0e41\u0e04\u0e48\u0e44\u0e2b\u0e19 \u0e19\u0e49\u0e2d\u0e07\u0e44\u0e21\u0e48\u0e01\u0e25\u0e31\u0e27 
\u0e40\u0e1e\u0e23\u0e32\u0e30\u0e19\u0e49\u0e2d\u0e07\u0e23\u0e39\u0e49\u0e27\u0e48\u0e32\u0e1e\u0e35\u0e48\u0e21\u0e35\u0e17\u0e35\u0e48\u0e04\u0e2d\u0e22\u0e0b\u0e31\u0e1e\u0e1e\u0e2d\u0e23\u0e4c\u0e15\u0e15\u0e25\u0e2d\u0e14 
\u0e44\u0e21\u0e48\u0e27\u0e48\u0e32\u0e08\u0e30\u0e40\u0e19\u0e37\u0e49\u0e2d\u0e07\u0e32\u0e19\u0e2b\u0e23\u0e37\u0e2d\u0e2a\u0e48\u0e07\u0e19\u0e49\u0e2d\u0e07\u0e44\u0e1b\u0e40\u0e1b\u0e47\u0e19\u0e41\u0e23\u0e07\u0e1b\u0e30\u0e17\u0e30555`,
        `\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e40\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e41\u0e0b\u0e27\u0e2b\u0e23\u0e37\u0e2d\u0e41\u0e0b\u0e30 \u0e17\u0e35\u0e48\u0e1c\u0e48\u0e32\u0e19\u0e21\u0e32\u0e44\u0e21\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e01\u0e31\u0e07\u0e27\u0e25\u0e19\u0e49\u0e2d\u0e07\u0e44\u0e21\u0e48\u0e42\u0e01\u0e23\u0e18\u0e2b\u0e23\u0e2d\u0e01 
\u0e22\u0e2d\u0e21\u0e23\u0e31\u0e1a\u0e27\u0e48\u0e32\u0e40\u0e02\u0e49\u0e32\u0e21\u0e32\u0e41\u0e25\u0e01\u0e46\u0e01\u0e47\u0e44\u0e21\u0e48\u0e0a\u0e34\u0e19 \u0e19\u0e49\u0e2d\u0e07\u0e42\u0e14\u0e19\u0e15\u0e25\u0e2d\u0e14\u0e40\u0e27\u0e25\u0e32 
\u0e41\u0e15\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e1b\u0e23\u0e31\u0e1a\u0e15\u0e31\u0e27\u0e44\u0e14\u0e49 \u0e19\u0e49\u0e2d\u0e07\u0e40\u0e25\u0e22\u0e44\u0e21\u0e48\u0e40\u0e01\u0e47\u0e1a\u0e40\u0e2d\u0e32\u0e21\u0e32\u0e04\u0e34\u0e14\u0e21\u0e32\u0e01 
\u0e19\u0e49\u0e2d\u0e07\u0e23\u0e39\u0e49\u0e27\u0e48\u0e32\u0e1e\u0e35\u0e48\u0e41\u0e04\u0e48\u0e41\u0e0b\u0e27\u0e40\u0e25\u0e48\u0e19 \u0e41\u0e15\u0e48\u0e17\u0e35\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e17\u0e33\u0e07\u0e2d\u0e19\u0e01\u0e47\u0e40\u0e1e\u0e23\u0e32\u0e30\u0e2d\u0e22\u0e32\u0e01\u0e43\u0e2b\u0e49\u0e04\u0e34\u0e14\u0e27\u0e48\u0e32
\u0e1a\u0e32\u0e07\u0e40\u0e23\u0e37\u0e48\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e40\u0e23\u0e32\u0e21\u0e2d\u0e07\u0e27\u0e48\u0e32\u0e15\u0e25\u0e01\u0e41\u0e15\u0e48\u0e1a\u0e32\u0e07\u0e04\u0e19\u0e40\u0e02\u0e32\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e15\u0e25\u0e01\u0e14\u0e49\u0e27\u0e225555 
\u0e01\u0e47\u0e2d\u0e22\u0e32\u0e01\u0e43\u0e2b\u0e49\u0e04\u0e34\u0e14 \u0e40\u0e14\u0e30\u0e44\u0e1b\u0e40\u0e25\u0e48\u0e19\u0e01\u0e31\u0e1a\u0e04\u0e19\u0e2d\u0e37\u0e48\u0e19\u0e41\u0e25\u0e49\u0e27\u0e40\u0e02\u0e32\u0e42\u0e01\u0e23\u0e18\u0e08\u0e23\u0e34\u0e07\u0e08\u0e30\u0e07\u0e32\u0e19\u0e40\u0e02\u0e49\u0e32\u0e40\u0e2d\u0e32\u0e19\u0e30

\u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e17\u0e35\u0e48\u0e40\u0e1b\u0e47\u0e19\u0e1e\u0e35\u0e48\u0e17\u0e35\u0e48\u0e14\u0e35\u0e02\u0e2d\u0e07\u0e19\u0e49\u0e2d\u0e07\u0e40\u0e2a\u0e21\u0e2d \u0e2a\u0e2d\u0e19\u0e41\u0e25\u0e30\u0e40\u0e1b\u0e47\u0e19\u0e2b\u0e48\u0e27\u0e07\u0e19\u0e49\u0e2d\u0e07\u0e43\u0e19\u0e17\u0e38\u0e01\u0e40\u0e23\u0e37\u0e48\u0e2d\u0e07 
\u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e04\u0e27\u0e32\u0e21\u0e2b\u0e27\u0e31\u0e07\u0e14\u0e35\u0e43\u0e19\u0e17\u0e38\u0e01\u0e2d\u0e22\u0e48\u0e32\u0e07 \u0e17\u0e35\u0e48\u0e04\u0e2d\u0e22\u0e40\u0e15\u0e37\u0e2d\u0e19\u0e40\u0e27\u0e25\u0e32\u0e19\u0e49\u0e2d\u0e07\u0e2b\u0e31\u0e27\u0e23\u0e49\u0e2d\u0e19555`,
        `\u0e22\u0e2d\u0e21\u0e23\u0e31\u0e1a\u0e40\u0e25\u0e22\u0e27\u0e48\u0e32\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48 PCU \u0e40\u0e2b\u0e25\u0e37\u0e2d\u0e2a\u0e2d\u0e07\u0e04\u0e19 \u0e19\u0e49\u0e2d\u0e07\u0e01\u0e31\u0e07\u0e27\u0e25\u0e21\u0e32\u0e01 
\u0e19\u0e49\u0e2d\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e01\u0e31\u0e07\u0e27\u0e25\u0e17\u0e35\u0e48\u0e07\u0e32\u0e19\u0e2b\u0e19\u0e31\u0e01\u0e02\u0e36\u0e49\u0e19 \u0e41\u0e15\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e01\u0e25\u0e31\u0e27\u0e1e\u0e35\u0e48\u0e08\u0e30\u0e17\u0e34\u0e49\u0e07\u0e19\u0e49\u0e2d\u0e07\u0e44\u0e1b 
\u0e19\u0e49\u0e2d\u0e07\u0e40\u0e25\u0e22\u0e1a\u0e2d\u0e01\u0e1e\u0e35\u0e48\u0e40\u0e2a\u0e21\u0e2d\u0e27\u0e48\u0e32 \u0e16\u0e49\u0e32\u0e1e\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e2d\u0e22\u0e39\u0e48 \u0e16\u0e49\u0e32\u0e1e\u0e35\u0e48\u0e44\u0e21\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e44\u0e21\u0e48\u0e2d\u0e22\u0e39\u0e48 
\u0e0b\u0e36\u0e48\u0e07\u0e2a\u0e38\u0e14\u0e17\u0e49\u0e32\u0e22\u0e41\u0e25\u0e49\u0e27\u0e1e\u0e35\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e44\u0e21\u0e48\u0e17\u0e34\u0e49\u0e07\u0e19\u0e49\u0e2d\u0e07\u0e08\u0e23\u0e34\u0e07\u0e46

\u0e43\u0e19\u0e27\u0e31\u0e19\u0e17\u0e35\u0e48\u0e15\u0e49\u0e2d\u0e07\u0e41\u0e22\u0e01 PROJECT \u0e19\u0e49\u0e2d\u0e07\u0e23\u0e39\u0e49\u0e2a\u0e36\u0e01\u0e27\u0e48\u0e32\u0e19\u0e49\u0e2d\u0e07\u0e14\u0e39\u0e40\u0e2b\u0e47\u0e19\u0e41\u0e01\u0e48\u0e15\u0e31\u0e27\u0e17\u0e35\u0e48\u0e43\u0e2b\u0e49\u0e1e\u0e35\u0e48\u0e44\u0e1b\u0e17\u0e33 CLINITER 
\u0e41\u0e25\u0e30\u0e19\u0e49\u0e2d\u0e07\u0e40\u0e25\u0e37\u0e2d\u0e01\u0e17\u0e35\u0e48\u0e08\u0e30\u0e17\u0e33 PCU \u0e17\u0e31\u0e49\u0e07\u0e17\u0e35\u0e48 PCU \u0e16\u0e49\u0e32\u0e1e\u0e35\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e2d\u0e22\u0e39\u0e48\u0e08\u0e30\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e2b\u0e32\u0e40\u0e04\u0e2a\u0e41\u0e25\u0e30\u0e27\u0e34\u0e40\u0e04\u0e23\u0e32\u0e30\u0e2b\u0e4c\u0e44\u0e14\u0e49\u0e14\u0e35\u0e01\u0e27\u0e48\u0e32\u0e19\u0e49\u0e2d\u0e07 
\u0e40\u0e1e\u0e23\u0e32\u0e30\u0e2a\u0e38\u0e14\u0e17\u0e49\u0e32\u0e22\u0e41\u0e25\u0e49\u0e27\u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e44\u0e21\u0e48\u0e2a\u0e32\u0e21\u0e32\u0e23\u0e16\u0e17\u0e33\u0e21\u0e31\u0e19\u0e17\u0e31\u0e49\u0e07\u0e2b\u0e21\u0e14\u0e44\u0e14\u0e49\u0e14\u0e49\u0e27\u0e22\u0e15\u0e31\u0e27\u0e40\u0e2d\u0e07 \u0e41\u0e25\u0e30\u0e44\u0e1b\u0e02\u0e2d\u0e43\u0e2b\u0e49\u0e1e\u0e35\u0e48\u0e21\u0e32\u0e0a\u0e48\u0e27\u0e22 
\u0e41\u0e25\u0e30\u0e02\u0e2d\u0e42\u0e17\u0e29\u0e17\u0e35\u0e48\u0e17\u0e33\u0e43\u0e2b\u0e49\u0e1e\u0e35\u0e48\u0e0a\u0e32\u0e22\u0e23\u0e39\u0e49\u0e2a\u0e36\u0e01\u0e44\u0e21\u0e48\u0e14\u0e35\u0e40\u0e01\u0e35\u0e48\u0e22\u0e27\u0e01\u0e31\u0e1a\u0e07\u0e32\u0e19\u0e17\u0e35\u0e21PCU \u0e41\u0e25\u0e30\u0e02\u0e2d\u0e42\u0e17\u0e29\u0e17\u0e35\u0e48\u0e17\u0e33\u0e43\u0e2b\u0e49\u0e23\u0e39\u0e49\u0e2a\u0e36\u0e01\u0e40\u0e2b\u0e07\u0e32`,
        `\u0e22\u0e2d\u0e21\u0e23\u0e31\u0e1a\u0e40\u0e25\u0e22\u0e27\u0e48\u0e32\u0e15\u0e2d\u0e19\u0e17\u0e35\u0e48\u0e1e\u0e35\u0e48\u0e41\u0e22\u0e21\u0e42\u0e17\u0e23\u0e21\u0e32 \u0e19\u0e49\u0e2d\u0e07\u0e0a\u0e47\u0e2d\u0e04\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e01\u0e31\u0e19 \u0e14\u0e35\u0e43\u0e08\u0e41\u0e25\u0e30\u0e40\u0e2a\u0e35\u0e22\u0e43\u0e08\u0e44\u0e1b\u0e1e\u0e23\u0e49\u0e2d\u0e21\u0e01\u0e31\u0e19 
\u0e14\u0e35\u0e43\u0e08\u0e17\u0e35\u0e48\u0e17\u0e33\u0e44\u0e14\u0e49 \u0e41\u0e15\u0e48\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e23\u0e39\u0e49\u0e2a\u0e36\u0e01\u0e14\u0e35\u0e43\u0e08\u0e17\u0e35\u0e48\u0e44\u0e14\u0e49\u0e07\u0e32\u0e19\u0e43\u0e2b\u0e21\u0e48\u0e02\u0e19\u0e32\u0e14\u0e19\u0e31\u0e49\u0e19 
\u0e04\u0e27\u0e32\u0e21\u0e23\u0e39\u0e49\u0e2a\u0e36\u0e01\u0e15\u0e2d\u0e19\u0e19\u0e31\u0e49\u0e19\u0e1c\u0e21\u0e40\u0e1b\u0e47\u0e19\u0e1e\u0e35\u0e48\u0e2b\u0e48\u0e27\u0e07\u0e1e\u0e35\u0e48\u0e1c\u0e21\u0e2a\u0e38\u0e14 
\u0e15\u0e25\u0e2d\u0e14\u0e40\u0e27\u0e25\u0e32\u0e43\u0e19\u0e01\u0e32\u0e23\u0e2b\u0e32\u0e07\u0e32\u0e19 \u0e40\u0e1b\u0e47\u0e19\u0e01\u0e32\u0e23\u0e2b\u0e32\u0e07\u0e32\u0e19\u0e17\u0e35\u0e48\u0e40\u0e28\u0e23\u0e49\u0e32\u0e2a\u0e38\u0e14 
\u0e43\u0e19\u0e43\u0e08\u0e1c\u0e21\u0e2d\u0e22\u0e32\u0e01\u0e43\u0e2b\u0e49\u0e1e\u0e35\u0e48\u0e1c\u0e21\u0e44\u0e14\u0e49\u0e07\u0e32\u0e19\u0e01\u0e48\u0e2d\u0e19 \u0e40\u0e1e\u0e23\u0e32\u0e30\u0e1c\u0e21\u0e23\u0e39\u0e49\u0e27\u0e48\u0e32\u0e1e\u0e35\u0e48\u0e1c\u0e21\u0e15\u0e49\u0e2d\u0e07\u0e40\u0e2b\u0e07\u0e32\u0e41\u0e19\u0e48\u0e16\u0e49\u0e32\u0e44\u0e21\u0e48\u0e21\u0e35\u0e19\u0e49\u0e2d\u0e07 
\u0e15\u0e48\u0e2d\u0e43\u0e2b\u0e49\u0e19\u0e49\u0e2d\u0e07\u0e08\u0e30\u0e44\u0e14\u0e49\u0e07\u0e32\u0e19\u0e17\u0e35\u0e48\u0e2b\u0e25\u0e31\u0e07 \u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e44\u0e21\u0e48\u0e23\u0e39\u0e49\u0e2a\u0e36\u0e01\u0e40\u0e2a\u0e35\u0e22\u0e43\u0e08 
\u0e40\u0e1e\u0e23\u0e32\u0e30\u0e19\u0e49\u0e2d\u0e07\u0e04\u0e34\u0e14\u0e27\u0e48\u0e32\u0e19\u0e49\u0e2d\u0e07\u0e41\u0e02\u0e47\u0e07\u0e41\u0e01\u0e23\u0e48\u0e07\u0e01\u0e27\u0e48\u0e32 \u0e19\u0e49\u0e2d\u0e07\u0e2d\u0e22\u0e39\u0e48\u0e44\u0e14\u0e49 
\u0e19\u0e49\u0e2d\u0e07\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e2d\u0e22\u0e32\u0e01\u0e43\u0e2b\u0e49\u0e1e\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e14\u0e49\u0e27\u0e22\u0e04\u0e27\u0e32\u0e21\u0e40\u0e28\u0e23\u0e49\u0e32 \u0e41\u0e15\u0e48\u0e2a\u0e38\u0e14\u0e17\u0e49\u0e32\u0e22\u0e41\u0e25\u0e49\u0e27\u0e01\u0e25\u0e32\u0e22\u0e40\u0e1b\u0e47\u0e19\u0e1c\u0e21\u0e17\u0e35\u0e48\u0e17\u0e34\u0e49\u0e07\u0e1e\u0e35\u0e48\u0e1c\u0e21`,
        `\u0e1c\u0e21\u0e2d\u0e22\u0e32\u0e01\u0e1a\u0e2d\u0e01\u0e27\u0e48\u0e32\u0e23\u0e39\u0e49\u0e2a\u0e36\u0e01\u0e40\u0e2a\u0e35\u0e22\u0e43\u0e08\u0e41\u0e25\u0e30\u0e40\u0e1b\u0e47\u0e19\u0e2b\u0e48\u0e27\u0e07\u0e1e\u0e35\u0e48\u0e1c\u0e21\u0e21\u0e32\u0e01\u0e46\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e01\u0e31\u0e19\u0e19\u0e30 
\u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e04\u0e27\u0e32\u0e21\u0e23\u0e39\u0e49\u0e2a\u0e36\u0e01\u0e14\u0e35\u0e46\u0e17\u0e35\u0e48\u0e21\u0e35\u0e43\u0e2b\u0e49\u0e19\u0e49\u0e2d\u0e07 \u0e43\u0e19\u0e27\u0e31\u0e19\u0e19\u0e35\u0e49\u0e1e\u0e35\u0e48\u0e01\u0e47\u0e22\u0e31\u0e07\u0e40\u0e1b\u0e47\u0e19\u0e1e\u0e35\u0e48\u0e0a\u0e32\u0e22\u0e17\u0e35\u0e48\u0e14\u0e35\u0e02\u0e2d\u0e07\u0e19\u0e49\u0e2d\u0e07 
\u0e41\u0e25\u0e49\u0e27\u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e2d\u0e22\u0e32\u0e01\u0e21\u0e35\u0e1e\u0e35\u0e48\u0e0a\u0e32\u0e22\u0e17\u0e35\u0e48\u0e2d\u0e22\u0e39\u0e48\u0e02\u0e49\u0e32\u0e07\u0e46\u0e19\u0e49\u0e2d\u0e07\u0e41\u0e1a\u0e1a\u0e19\u0e35\u0e49\u0e15\u0e25\u0e2d\u0e14\u0e44\u0e1b 
\u0e44\u0e21\u0e48\u0e23\u0e39\u0e49\u0e27\u0e48\u0e32\u0e2d\u0e19\u0e32\u0e04\u0e15\u0e08\u0e30\u0e40\u0e1b\u0e47\u0e19\u0e22\u0e31\u0e07\u0e44\u0e07 \u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e08\u0e30\u0e2d\u0e22\u0e39\u0e48\u0e02\u0e49\u0e32\u0e07\u0e46\u0e1e\u0e35\u0e48\u0e0a\u0e32\u0e22\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e01\u0e31\u0e19 
\u0e44\u0e21\u0e48\u0e27\u0e48\u0e32\u0e2a\u0e16\u0e32\u0e19\u0e30\u0e2d\u0e30\u0e44\u0e23\u0e2b\u0e23\u0e37\u0e2d\u0e08\u0e30\u0e40\u0e08\u0e2d\u0e1b\u0e31\u0e0d\u0e2b\u0e32\u0e2d\u0e30\u0e44\u0e23 \u0e42\u0e17\u0e23\u0e2b\u0e23\u0e37\u0e2d\u0e17\u0e31\u0e01\u0e21\u0e32\u0e2b\u0e32\u0e19\u0e49\u0e2d\u0e07\u0e44\u0e14\u0e49\u0e40\u0e2a\u0e21\u0e2d 
\u0e16\u0e36\u0e07\u0e19\u0e49\u0e2d\u0e07\u0e08\u0e30\u0e0a\u0e48\u0e27\u0e22\u0e41\u0e01\u0e49\u0e1b\u0e31\u0e0d\u0e2b\u0e32\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e41\u0e15\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e0a\u0e48\u0e27\u0e22\u0e23\u0e31\u0e1a\u0e1f\u0e31\u0e07\u0e41\u0e25\u0e30\u0e40\u0e25\u0e48\u0e19\u0e21\u0e38\u0e01\u0e43\u0e2b\u0e49\u0e02\u0e33\u0e2b\u0e23\u0e37\u0e2d\u0e40\u0e04\u0e23\u0e35\u0e22\u0e14\u0e01\u0e27\u0e48\u0e32\u0e40\u0e14\u0e34\u0e21\u0e44\u0e14\u0e49555 
\u0e0b\u0e36\u0e48\u0e07\u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e08\u0e30\u0e17\u0e31\u0e01\u0e2b\u0e32\u0e41\u0e1a\u0e1a\u0e44\u0e21\u0e48\u0e40\u0e01\u0e23\u0e07\u0e43\u0e08\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e01\u0e31\u0e19 \u0e01\u0e47\u0e16\u0e49\u0e32\u0e1e\u0e35\u0e48\u0e1c\u0e21\u0e2b\u0e32\u0e22\u0e44\u0e1b\u0e1c\u0e21\u0e01\u0e47\u0e08\u0e30\u0e27\u0e35\u0e19\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e40\u0e14\u0e34\u0e21 \u0e08\u0e19\u0e43\u0e2b\u0e49\u0e14\u0e48\u0e32\u0e19\u0e49\u0e2d\u0e07\u0e44\u0e14\u0e49\u0e40\u0e25\u0e22

\u0e2a\u0e33\u0e2b\u0e23\u0e31\u0e1a\u0e02\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e43\u0e2b\u0e49\u0e19\u0e49\u0e2d\u0e07\u0e2b\u0e25\u0e32\u0e22\u0e46\u0e2d\u0e22\u0e48\u0e32\u0e07 \u0e19\u0e49\u0e2d\u0e07\u0e23\u0e39\u0e49\u0e27\u0e48\u0e32\u0e1e\u0e35\u0e48\u0e02\u0e2d\u0e07\u0e2d\u0e22\u0e32\u0e01\u0e43\u0e2b\u0e49 
\u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e15\u0e31\u0e49\u0e07\u0e43\u0e08\u0e23\u0e31\u0e1a\u0e17\u0e38\u0e01\u0e0a\u0e34\u0e49\u0e19 \u0e41\u0e15\u0e48\u0e41\u0e04\u0e48\u0e19\u0e49\u0e2d\u0e07\u0e23\u0e39\u0e49\u0e27\u0e48\u0e32\u0e1a\u0e32\u0e07\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e21\u0e31\u0e19\u0e40\u0e22\u0e2d\u0e30\u0e2b\u0e23\u0e37\u0e2d\u0e41\u0e1e\u0e07\u0e44\u0e1b 
\u0e19\u0e49\u0e2d\u0e07\u0e44\u0e21\u0e48\u0e2d\u0e22\u0e32\u0e01\u0e40\u0e1b\u0e47\u0e19\u0e1c\u0e39\u0e49\u0e23\u0e31\u0e1a\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e40\u0e14\u0e35\u0e22\u0e27 \u0e19\u0e49\u0e2d\u0e07\u0e01\u0e47\u0e2d\u0e22\u0e32\u0e01\u0e40\u0e1b\u0e47\u0e19\u0e1c\u0e39\u0e49\u0e43\u0e2b\u0e49\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e01\u0e31\u0e19 
\u0e41\u0e15\u0e48 \u0e13 \u0e15\u0e2d\u0e19\u0e19\u0e35\u0e49\u0e1c\u0e21\u0e22\u0e31\u0e07\u0e44\u0e21\u0e48\u0e23\u0e39\u0e49\u0e40\u0e25\u0e22\u0e27\u0e48\u0e32\u0e08\u0e30\u0e0b\u0e37\u0e49\u0e2d\u0e2d\u0e30\u0e44\u0e23\u0e43\u0e2b\u0e49\u0e1e\u0e35\u0e48\u0e1c\u0e21 \u0e1e\u0e35\u0e48\u0e1c\u0e21\u0e40\u0e25\u0e48\u0e19\u0e21\u0e35\u0e17\u0e38\u0e01\u0e2d\u0e22\u0e48\u0e32\u0e07\u0e02\u0e19\u0e32\u0e14\u0e19\u0e35\u0e49 
\u0e40\u0e2d\u0e32\u0e2b\u0e19\u0e48\u0e32\u0e16\u0e49\u0e32\u0e19\u0e49\u0e2d\u0e07\u0e19\u0e36\u0e01\u0e2d\u0e2d\u0e01\u0e19\u0e49\u0e2d\u0e07\u0e08\u0e30\u0e2a\u0e48\u0e07\u0e44\u0e1b`,
        `\u0e22\u0e31\u0e07\u0e44\u0e07\u0e01\u0e47\u0e44\u0e1b\u0e17\u0e35\u0e48\u0e43\u0e2b\u0e21\u0e48\u0e01\u0e47\u0e2d\u0e22\u0e48\u0e32\u0e25\u0e37\u0e21\u0e19\u0e49\u0e2d\u0e07\u0e25\u0e30 
\u0e19\u0e49\u0e2d\u0e07\u0e17\u0e35\u0e48\u0e19\u0e34\u0e2a\u0e31\u0e22\u0e14\u0e35 \u0e19\u0e48\u0e32\u0e23\u0e31\u0e01 \u0e19\u0e48\u0e32\u0e40\u0e2d\u0e47\u0e19\u0e14\u0e39\u0e41\u0e1a\u0e1a\u0e19\u0e35\u0e49\u0e44\u0e21\u0e48\u0e44\u0e14\u0e49\u0e2b\u0e32\u0e17\u0e35\u0e48\u0e44\u0e2b\u0e19\u0e01\u0e47\u0e44\u0e14\u0e49 \u0e41\u0e16\u0e21\u0e1c\u0e21\u0e22\u0e31\u0e07\u0e02\u0e22\u0e31\u0e19\u0e2d\u0e35\u0e01

\u0e2a\u0e38\u0e14\u0e17\u0e49\u0e32\u0e22\u0e41\u0e2b\u0e25\u0e30 \u0e02\u0e2d\u0e1a\u0e04\u0e38\u0e13\u0e17\u0e35\u0e48\u0e20\u0e39\u0e21\u0e34\u0e43\u0e08\u0e43\u0e19\u0e15\u0e31\u0e27\u0e19\u0e49\u0e2d\u0e07 
\u0e04\u0e27\u0e32\u0e21\u0e23\u0e39\u0e49\u0e19\u0e49\u0e2d\u0e07\u0e21\u0e35\u0e41\u0e25\u0e30\u0e40\u0e01\u0e48\u0e07\u0e44\u0e14\u0e49\u0e17\u0e38\u0e01\u0e27\u0e31\u0e19\u0e19\u0e35\u0e49\u0e01\u0e47\u0e21\u0e32\u0e08\u0e32\u0e01\u0e1e\u0e35\u0e48\u0e1c\u0e21\u0e17\u0e31\u0e49\u0e07\u0e19\u0e31\u0e49\u0e19 
\u0e41\u0e25\u0e49\u0e27\u0e19\u0e49\u0e2d\u0e07\u0e08\u0e30\u0e1b\u0e23\u0e30\u0e2a\u0e1a\u0e04\u0e27\u0e32\u0e21\u0e2a\u0e33\u0e40\u0e23\u0e47\u0e08 \u0e40\u0e2d\u0e32\u0e04\u0e27\u0e32\u0e21\u0e23\u0e39\u0e49\u0e08\u0e32\u0e01\u0e1e\u0e35\u0e48\u0e0a\u0e32\u0e22\u0e44\u0e1b\u0e15\u0e48\u0e2d\u0e22\u0e2d\u0e14 
\u0e09\u0e25\u0e32\u0e14\u0e01\u0e27\u0e48\u0e32\u0e40\u0e14\u0e34\u0e2110 \u0e40\u0e17\u0e48\u0e32 \u0e41\u0e25\u0e49\u0e27\u0e01\u0e47\u0e2d\u0e22\u0e48\u0e32\u0e25\u0e37\u0e21\u0e20\u0e39\u0e21\u0e34\u0e43\u0e08\u0e01\u0e31\u0e1a\u0e15\u0e31\u0e27\u0e40\u0e2d\u0e07\u0e14\u0e49\u0e27\u0e22\u0e25\u0e30 
\u0e1e\u0e35\u0e48\u0e1c\u0e21\u0e40\u0e01\u0e48\u0e07\u0e2d\u0e22\u0e39\u0e48\u0e41\u0e25\u0e49\u0e27 \u0e1c\u0e21\u0e01\u0e47\u0e20\u0e39\u0e21\u0e34\u0e43\u0e08\u0e43\u0e19\u0e15\u0e31\u0e27\u0e1e\u0e35\u0e48\u0e1c\u0e21\u0e40\u0e2b\u0e21\u0e37\u0e2d\u0e19\u0e01\u0e31\u0e19 \u0e41\u0e1a\u0e23\u0e48

\u0e19\u0e49\u0e2d\u0e07\u0e23\u0e31\u0e01\u0e41\u0e25\u0e30\u0e40\u0e1b\u0e47\u0e19\u0e2b\u0e48\u0e27\u0e07\u0e1e\u0e35\u0e48\u0e0a\u0e32\u0e22\u0e40\u0e2a\u0e21\u0e2d\u2764\ufe0f 

\u0e41\u0e1e\u0e23\u0e27
`
      ]
    }
  ];

  const selectedLetter = letters.find(l => l.id === selectedLetterId);
  const letterPages = selectedLetter?.pages || [];

  useEffect(() => {
    // Generate random stars for the background
    const newStars = Array.from({ length: 30 }).map((_, i) => ({
      id: i,
      left: `${Math.random() * 100}%`,
      top: `${Math.random() * 100}%`,
      delay: `${Math.random() * 8}s`,
      duration: `${Math.random() * 5 + 5}s`,
    }));
    setStars(newStars);
  }, []);

  useEffect(() => {
    if (isOpening) {
      const flapTimer = setTimeout(() => setIsOpen(true), 1200); 
      return () => clearTimeout(flapTimer);
    }
  }, [isOpening]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(() => setShowText(true), 800);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleOpenEnvelope = () => {
    if (!isOpening && !isOpen) {
      setIsOpening(true);
    }
  };

  const handleNextPage = () => {
    if (currentPage < letterPages.length - 1) {
      setShowText(false);
      setTimeout(() => {
        setCurrentPage(currentPage + 1);
        setShowText(true);
      }, 300);
    }
  };

  const handlePrevPage = () => {
    if (currentPage > 0) {
        setShowText(false);
        setTimeout(() => {
          setCurrentPage(currentPage - 1);
          setShowText(true);
        }, 300);
    }
  };

  const handleSelectLetter = (id: number) => {
    setSelectedLetterId(id);
    setIsOpen(false);
    setIsOpening(false);
    setShowText(false);
    setCurrentPage(0);
  };

  const handleBackToSelection = () => {
    setSelectedLetterId(null);
    setIsOpen(false);
    setIsOpening(false);
    setShowText(false);
    setCurrentPage(0);
  };

  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);

  const handlePasswordSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (password.toLowerCase() === "pwsn") {
      setIsAuthorized(true);
      setError(false);
      setSelectedLetterId(null);
    } else {
      setError(true);
    }
  };

  if (!isAuthorized) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#050508] text-white font-sans selection:bg-rose-500/30 relative overflow-hidden">
        <style dangerouslySetInnerHTML={{__html: `
          @keyframes float { 0%, 100% { transform: translateY(0px); } 50% { transform: translateY(-12px); } }
          @keyframes pulse-ring { 0% { transform: scale(0.9); opacity: 0.6; } 50% { transform: scale(1.15); opacity: 0; } 100% { transform: scale(0.9); opacity: 0; } }
          @keyframes shimmer { 0% { background-position: -200% center; } 100% { background-position: 200% center; } }
          @keyframes fadeUp { 0% { opacity: 0; transform: translateY(20px); } 100% { opacity: 1; transform: translateY(0); } }
          @keyframes twinkle { 0%, 100% { opacity: 0.05; } 50% { opacity: 0.5; } }
        `}} />

        {/* Ambient background particles */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white rounded-full animate-[twinkle_5s_ease-in-out_infinite]"
              style={{
                left: star.left,
                top: star.top,
                width: "1.5px",
                height: "1.5px",
                animationDelay: star.delay,
                animationDuration: star.duration,
              }}
            />
          ))}
        </div>

        {/* Radial glow behind card */}
        <div className="absolute w-[600px] h-[600px] rounded-full bg-gradient-to-r from-violet-600/8 to-rose-500/5 blur-[120px] pointer-events-none" />

        <div className="relative z-10 w-full max-w-[420px] animate-[fadeUp_0.8s_ease-out]">
          {/* Floating icon */}
          <div className="flex justify-center mb-10">
            <div className="relative animate-[float_6s_ease-in-out_infinite]">
              <div className="absolute inset-0 rounded-full bg-violet-500/20 animate-[pulse-ring_3s_ease-out_infinite]" style={{ width: '88px', height: '88px', margin: '-4px' }} />
              <div className="w-20 h-20 rounded-full bg-gradient-to-br from-violet-600/30 to-rose-500/20 flex items-center justify-center border border-white/10 backdrop-blur-xl shadow-2xl shadow-violet-500/10">
                <Sparkles className="w-8 h-8 text-violet-300" />
              </div>
            </div>
          </div>

          {/* Card */}
          <div className="p-10 rounded-[2rem] bg-white/[0.03] backdrop-blur-2xl border border-white/[0.06] shadow-[0_32px_64px_rgba(0,0,0,0.5)]">
            <div className="flex flex-col items-center text-center space-y-8">
              <div className="space-y-3">
                <h1 className={`${playfair.className} text-3xl font-bold tracking-tight text-white`}>
                  Hi, Preaw , Champ
                </h1>
                <p className="text-zinc-500 text-sm leading-relaxed">
                  Enter the access key to reveal your letter.
                </p>
              </div>

              <form onSubmit={handlePasswordSubmit} className="w-full space-y-6">
                <div className="relative">
                  <input
                    autoFocus
                    type="password"
                    value={password}
                    onChange={(e) => { setPassword(e.target.value); setError(false); }}
                    placeholder="Enter key..."
                    className={`w-full bg-white/[0.04] border rounded-xl py-4 px-6 text-white placeholder:text-zinc-600 focus:outline-none focus:border-violet-500/50 focus:bg-white/[0.06] transition-all text-center tracking-[0.3em] font-medium text-sm
                      ${error ? 'border-rose-500/40 bg-rose-500/[0.04]' : 'border-white/[0.06]'}
                    `}
                  />
                  <div className={`absolute inset-x-0 -bottom-7 flex justify-center transition-all duration-300 ${error ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-2'}`}>
                    <p className="text-rose-400 text-[10px] font-bold uppercase tracking-[0.2em]">Access Denied</p>
                  </div>
                </div>

                <div className="pt-2">
                  <button
                    type="submit"
                    className="w-full py-4 rounded-xl font-bold text-sm tracking-widest uppercase transition-all active:scale-[0.97] relative overflow-hidden group/btn bg-gradient-to-r from-violet-600 to-violet-500 hover:from-violet-500 hover:to-violet-400 text-white shadow-lg shadow-violet-500/20 hover:shadow-violet-500/30"
                  >
                    <span className="relative z-10">Confirm Key</span>
                    <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent opacity-0 group-hover/btn:opacity-100 animate-[shimmer_2s_infinite] bg-[length:200%_100%] transition-opacity" />
                  </button>
                </div>
              </form>

              <button 
                onClick={() => window.location.href = '/dashboard'}
                className="text-zinc-600 hover:text-zinc-400 text-[10px] font-bold transition-colors tracking-[0.2em] uppercase pt-2"
              >
                Exit to Dashboard
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!selectedLetterId) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0a] text-white font-sans relative overflow-hidden">
        {/* Particle Stars */}
        <div className="absolute inset-0 z-0 pointer-events-none">
          {stars.map((star) => (
            <div
              key={star.id}
              className="absolute bg-white rounded-full opacity-20 animate-pulse"
              style={{
                left: star.left,
                top: star.top,
                width: "1.5px",
                height: "1.5px",
                animationDelay: star.delay,
              }}
            />
          ))}
        </div>

        <div className="z-10 w-full max-w-4xl space-y-12 text-center">
            <div className="space-y-4">
                <h1 className={`${playfair.className} text-4xl sm:text-5xl font-bold tracking-tight bg-gradient-to-r from-white via-white to-white/40 bg-clip-text text-transparent`}>
                    Choose a Memory
                </h1>
                <p className="text-zinc-400 text-lg">จดหมายที่ตั้งใจเขียนให้คุณ</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 px-4">
                {letters.map((letter) => {
                    const isMale = letter.id === 1;
                    const accentColor = isMale ? 'rgb(99, 102, 241)' : 'rgb(244, 114, 182)';
                    const accentBg = isMale ? 'rgba(99, 102, 241, 0.1)' : 'rgba(244, 114, 182, 0.1)';
                    const accentBorder = isMale ? 'rgba(99, 102, 241, 0.2)' : 'rgba(244, 114, 182, 0.2)';
                    const hoverBorder = isMale ? 'hover:border-indigo-500/50' : 'hover:border-pink-400/50';
                    const hoverText = isMale ? 'group-hover:text-indigo-400' : 'group-hover:text-pink-400';
                    const hoverBtnBg = isMale ? 'group-hover:bg-indigo-500 group-hover:border-indigo-500' : 'group-hover:bg-pink-500 group-hover:border-pink-500';
                    const gradientFrom = isMale ? 'from-indigo-500/10' : 'from-pink-500/10';

                    return (
                    <button
                        key={letter.id}
                        onClick={() => handleSelectLetter(letter.id)}
                        className={`group relative flex flex-col items-center p-10 rounded-[2.5rem] bg-zinc-900/40 border border-white/5 ${hoverBorder} transition-all duration-500 overflow-hidden active:scale-[0.98]`}
                    >
                        <div className={`absolute inset-0 bg-gradient-to-br ${gradientFrom} to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
                        
                        <div className="w-20 h-20 mb-6 rounded-3xl flex items-center justify-center group-hover:scale-110 transition-transform duration-500" style={{ backgroundColor: accentBg, borderWidth: 1, borderColor: accentBorder }}>
                             <MailOpen className="w-10 h-10" style={{ color: accentColor }} />
                        </div>

                        <h3 className={`text-2xl font-bold mb-2 ${hoverText} transition-colors`}>{letter.title}</h3>
                        <p className="text-zinc-500 text-sm group-hover:text-zinc-400 transition-colors">{letter.description}</p>
                        
                        <div className={`mt-8 px-6 py-2 rounded-full border border-white/10 text-[10px] uppercase font-bold tracking-widest text-zinc-500 ${hoverBtnBg} group-hover:text-white transition-all`}>
                            Open Letter
                        </div>
                    </button>
                    );
                })}
            </div>

            <button 
                onClick={lock}
                className="inline-flex items-center gap-2 text-zinc-500 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em]"
            >
                <Lock className="w-3 h-3" /> Reset Session
            </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 bg-[#0a0a0a] overflow-x-hidden pt-20 relative text-white font-sans w-full selection:bg-rose-200">
      <style dangerouslySetInnerHTML={{__html: `
        @keyframes twinkle {
          0%, 100% { opacity: 0.1; }
          50% { opacity: 0.6; }
        }
        @keyframes open-flap {
            0% { transform: rotateX(0deg); z-index: 40; }
            100% { transform: rotateX(180deg); z-index: 10; }
        }
        @keyframes letter-pull {
            0% { transform: translateY(15%) scale(0.98); opacity: 0; }
            100% { transform: translateY(0) scale(1); opacity: 1; }
        }
        .letter-emerge { animation: letter-pull 1.4s cubic-bezier(0.16, 1, 0.3, 1) forwards; }
        .envelope-open { animation: open-flap 1s cubic-bezier(0.4, 0, 0.2, 1) forwards; transform-origin: top; }
        
        .paper-texture {
            background-image: url("https://www.transparenttextures.com/patterns/natural-paper.png");
        }

        .wax-seal {
            background: radial-gradient(circle at 35% 35%, #a80000, #8b0000 65%, #600000);
            border-radius: 48% 52% 54% 46% / 42% 58% 45% 55%;
            border: 1px solid rgba(255,255,255,0.1);
            box-shadow: 
                0 4px 12px rgba(0,0,0,0.5),
                inset 0 2px 4px rgba(255,255,255,0.4),
                inset 0 -2px 10px rgba(0,0,0,0.7),
                inset 3px 0 6px rgba(255,255,255,0.1);
            filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
            transition: transform 0.3s ease;
        }

        .wax-seal-impression {
            border-radius: 50%;
            box-shadow: 
                inset 0 2px 6px rgba(0,0,0,0.9),
                0 1px 2px rgba(255,255,255,0.2);
            background: rgba(0,0,0,0.15);
        }
      `}} />

      {/* Back button */}
      <div className="fixed top-8 left-8 z-50">
        <button 
            onClick={handleBackToSelection}
            className="group flex items-center gap-2 px-4 py-2 rounded-full bg-white/5 border border-white/10 text-white/50 hover:bg-white/10 hover:text-white transition-all text-[10px] uppercase tracking-widest font-bold backdrop-blur-md"
        >
            <ArrowLeft className="w-3 h-3 group-hover:-translate-x-1 transition-transform" /> Selection
        </button>
      </div>

      {/* Subtle Starry Background */}
      <div className="absolute inset-0 z-0 pointer-events-none">
        {stars.map((star) => (
          <div
            key={star.id}
            className="absolute bg-white rounded-full opacity-0 animate-[twinkle_5s_ease-in-out_infinite]"
            style={{
              left: star.left,
              top: star.top,
              width: "2px",
              height: "2px",
              animationDelay: star.delay,
              animationDuration: star.duration,
            }}
          />
        ))}
      </div>

      <div className="z-10 w-full max-w-5xl px-4 relative flex flex-col items-center justify-center py-10">
        
        {/* Envelope Container */}
        {!isOpen && (
          <div 
              className={`transition-all duration-1000 ease-out relative w-full max-w-lg perspective-[1000px]
                  ${isOpening ? 'opacity-0 scale-95 blur-md delay-[1000ms] pointer-events-none absolute' : 'opacity-100'}
              `}
          >
              <div 
                  className="relative w-full aspect-[3/2] max-w-[480px] mx-auto group cursor-pointer"
                  onClick={handleOpenEnvelope}
                  onMouseEnter={() => setIsHovering(true)}
                  onMouseLeave={() => setIsHovering(false)}
              >
                  {/* Envelope Back */}
                  <div className="absolute inset-0 bg-[#4a0e0e] rounded-lg shadow-2xl border border-white/5 z-10 transition-transform duration-500 group-hover:scale-[1.02]"></div>
                  
                  {/* Flaps */}
                  <div className="absolute inset-0 z-30 overflow-hidden rounded-lg">
                      <div className="absolute top-0 bottom-0 left-0 w-1/2 bg-[#5d1212] origin-left skew-y-[25deg] border-r border-black/10"></div>
                      <div className="absolute top-0 bottom-0 right-0 w-1/2 bg-[#5d1212] origin-right -skew-y-[25deg] border-l border-black/10"></div>
                      <div className="absolute bottom-0 left-0 right-0 h-1/2 bg-[#6b1515] origin-bottom border-t border-white/5 shadow-inner z-10"></div>
                  </div>

                  {/* Top Flap */}
                  <div className={`absolute top-0 left-0 right-0 h-2/3 origin-top transform-style-3d z-40 transition-transform duration-700
                           ${isOpening ? 'envelope-open' : 'rotate-x-0'}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-[#7c1c1c] to-[#5d1212] backface-hidden rounded-t-lg" 
                           style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
                      <div className="absolute inset-0 bg-[#3a0b0b] backface-hidden rounded-t-lg"
                           style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transform: 'rotateX(180deg)' }}></div>
                  </div>

                  {/* Ribbon & Seal */}
                  <div className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-700 ${isOpening ? 'opacity-0 scale-110' : 'opacity-100'}`}>
                      <div className="absolute w-8 h-full bg-[#c5a059]/30 backdrop-blur-[2px] border-x border-[#c5a059]/20 shadow-[0_0_15px_rgba(197,160,89,0.2)]"></div>
                      <div className="absolute h-8 w-full bg-[#c5a059]/30 backdrop-blur-[2px] border-y border-[#c5a059]/30 shadow-[0_0_15px_rgba(197,160,89,0.2)]"></div>
                      
                      {/* Wax Seal */}
                      <div className="relative w-18 h-18 wax-seal flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <div className="w-12 h-12 wax-seal-impression flex items-center justify-center">
                              <Heart className="w-7 h-7 text-pink-500" fill="currentColor" />
                          </div>
                      </div>
                  </div>

                  {/* Hint */}
                  {!isOpening && (
                      <div className={`absolute -bottom-16 left-1/2 -translate-x-1/2 text-rose-200/40 tracking-[0.3em] text-[10px] sm:text-xs flex items-center gap-3 transition-all duration-500 whitespace-nowrap uppercase ${isHovering ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}`}>
                          <Sparkles className="w-3 h-3" /> Click to open your letter <Sparkles className="w-3 h-3" />
                      </div>
                  )}
              </div>
          </div>
        )}

        {/* The Letter */}
        <div 
          className={`w-full max-w-7xl mx-auto transition-all duration-500
            ${isOpen ? 'relative z-20 block opacity-100 translate-y-0' : 'fixed invisible opacity-0 translate-y-10'}`}
        >
          <div className={`relative bg-[#fdfbf7] paper-texture text-[#3c2f2f] rounded-[2px] shadow-[0_15px_50px_rgba(0,0,0,0.4),0_2px_8px_rgba(0,0,0,0.1)] w-full min-h-[550px] max-h-[95vh] overflow-hidden flex flex-col border border-[#ebdcc1]
                ${isOpen ? 'letter-emerge' : ''}
          `}>
            {/* Paper Folds and Texture Overlays */}
            <div className="absolute inset-0 pointer-events-none z-0">
                {/* Vertical fold shadow */}
                <div className="absolute top-0 bottom-0 left-1/2 -translate-x-1/2 w-[1px] bg-black/5"></div>
                {/* Horizontal fold shadow */}
                <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-[1px] bg-black/5"></div>
            </div>
            
            {/* Decorations */}
            <div className="absolute top-8 right-8 flex items-center gap-4 z-20">
                <button 
                  onClick={lock}
                  className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-zinc-900/5 text-zinc-500 hover:bg-zinc-900/10 hover:text-zinc-800 transition-all text-[10px] uppercase tracking-widest font-bold border border-zinc-200"
                >
                  <Lock className="w-3 h-3" /> Lock
                </button>
                <a 
                  href="https://www.youtube.com/watch?v=dGD5rC7FKCI" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="w-14 h-14 wax-seal flex items-center justify-center cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-300"
                  title="Click for a special memory"
                >
                    <div className="w-9 h-9 wax-seal-impression flex items-center justify-center pointer-events-none">
                        <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
                    </div>
                </a>
            </div>
            
            {/* Content area */}
            <div className={`relative z-10 flex-1 flex flex-col pt-16 pb-10 px-8 sm:px-16 md:px-20 ${playfair.className}`}>
              <div className={`flex-1 flex flex-col justify-center transition-all duration-500 ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                {letterPages[currentPage]?.split('\n').map((line, index) => {
                  const isEmpty = line.trim() === '';
                  const isSignature = line.includes('—') || line.includes('Fluffy-ty');
                  
                  return (
                    <p 
                      key={`${currentPage}-${index}`} 
                      className={`text-sm sm:text-base md:text-lg leading-[1.5] tracking-wide mb-1 transition-all duration-700
                        ${showText ? 'opacity-100 translate-y-0 filter-none' : 'opacity-0 translate-y-2 blur-[2px]'}
                        ${isSignature ? tangerine.className + ' md:text-2xl mt-4 italic text-[#5d1212]' : ''}
                      `}
                      style={{ transitionDelay: `${index * 50}ms` }}
                    >
                      {isEmpty ? <span className="block h-4" /> : line}
                    </p>
                  );
                })}
              </div>
            </div>

            {/* Pagination Controls */}
            <div className={`relative z-10 flex items-center justify-between px-10 py-8 transition-opacity duration-1000 ${showText ? 'opacity-100' : 'opacity-0'}`}>
              <button
                onClick={handlePrevPage}
                disabled={currentPage === 0 || !showText}
                className={`group flex items-center gap-2 text-[#8b7e74] hover:text-[#3c2f2f] transition-all
                  ${currentPage === 0 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#ebdcc1] group-hover:bg-[#f3ead9] transition-colors shadow-sm">
                  <ChevronLeft className="w-4 h-4" />
                </div>
                <span className="text-[10px] tracking-[0.2em] font-bold uppercase font-sans">Back</span>
              </button>
              
              <div className="flex gap-3">
                {letterPages.map((_, idx) => (
                  <div 
                    key={idx} 
                    className={`h-[2px] transition-all duration-500 ${idx === currentPage ? 'w-10 bg-[#8b0000]' : 'w-4 bg-[#ebdcc1]'}`}
                  ></div>
                ))}
              </div>

              <button
                onClick={handleNextPage}
                disabled={currentPage === letterPages.length - 1 || !showText}
                className={`group flex items-center gap-2 text-[#8b7e74] hover:text-[#3c2f2f] transition-all
                  ${currentPage === letterPages.length - 1 ? 'opacity-0 pointer-events-none' : 'opacity-100'}`}
              >
                <span className="text-[10px] tracking-[0.2em] font-bold uppercase font-sans">Next</span>
                <div className="w-8 h-8 rounded-full flex items-center justify-center border border-[#ebdcc1] group-hover:bg-[#f3ead9] transition-colors shadow-sm">
                  <ChevronRight className="w-4 h-4" />
                </div>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
