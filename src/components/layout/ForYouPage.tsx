"use client";

import React, { useState, useEffect } from "react";
import { Heart, ChevronLeft, ChevronRight, Sparkles } from "lucide-react";
import { Playfair_Display, Tangerine } from "next/font/google";

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

export default function ForYouPage() {
  const [isHovering, setIsHovering] = useState(false);
  const [isOpening, setIsOpening] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showText, setShowText] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [stars, setStars] = useState<{ id: number; left: string; top: string; delay: string; duration: string }[]>([]);

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

  const letterPages = [
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
เองทำให้พี่อยากไปทำงานทุกวันเลยอะ อยากเก่ง อยากมีอะไรมาสอนน้อง`
,
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
แต่พี่อยากจะบอกว่าวันไหนที่น้องเริ่มต้นใหม่อีกครั้ง พี่อยากจะขอโอกาสนั้นได้ไหม...พี่รอได้นะ

ส่วนทางพี่ก็คิดว่าไม่นานก็คงออกมาอยู่คนเดียวดีกว่า พี่คิดว่าความคิด ความเข้าใจ ไม่เหมือนกันเลย 
คิดคนละแบบ คงไปด้วยกันไม่ได้จริงๆ ขอรักตัวเองบ้าง`
,
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
  ];

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

  return (
    <div className="py-8 my-auto bg-transparent flex items-center justify-center overflow-hidden relative text-white font-sans w-full selection:bg-rose-200">
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
                           ${isOpening ? 'envelope-open' : ''}`}>
                      <div className="absolute inset-0 bg-gradient-to-b from-[#7c1c1c] to-[#5d1212] backface-hidden rounded-t-lg" 
                           style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)' }}></div>
                      <div className="absolute inset-0 bg-[#3a0b0b] backface-hidden rounded-t-lg"
                           style={{ clipPath: 'polygon(0 0, 100% 0, 50% 100%)', transform: 'rotateX(180deg)' }}></div>
                  </div>

                  {/* Ribbon & Seal */}
                  <div className={`absolute inset-0 z-50 flex items-center justify-center transition-all duration-700 ${isOpening ? 'opacity-0 scale-110' : 'opacity-100'}`}>
                      <div className="absolute w-8 h-full bg-[#c5a059]/30 backdrop-blur-[2px] border-x border-[#c5a059]/20 shadow-[0_0_15px_rgba(197,160,89,0.2)]"></div>
                      <div className="absolute h-8 w-full bg-[#c5a059]/30 backdrop-blur-[2px] border-y border-[#c5a059]/20 shadow-[0_0_15px_rgba(197,160,89,0.2)]"></div>
                      
                      {/* Wax Seal */}
                      <div className="relative w-18 h-18 wax-seal flex items-center justify-center group-hover:scale-110 transition-transform duration-300">
                          <div className="w-12 h-12 wax-seal-impression flex items-center justify-center">
                              <Heart className="w-7 h-7 text-pink-500/20" fill="currentColor" />
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
            
            {/* Wax Seal Decoration - Linked to YouTube */}
            <a 
              href="https://www.youtube.com/watch?v=dGD5rC7FKCI" 
              target="_blank" 
              rel="noopener noreferrer"
              className="absolute top-8 right-8 w-14 h-14 wax-seal flex items-center justify-center z-20 cursor-pointer hover:scale-110 active:scale-95 transition-transform duration-300"
              title="Click for a special memory"
            >
                <div className="w-9 h-9 wax-seal-impression flex items-center justify-center pointer-events-none">
                    <Heart className="w-5 h-5 text-pink-500" fill="currentColor" />
                </div>
            </a>
            
            {/* Content area */}
            <div className={`relative z-10 flex-1 flex flex-col pt-16 pb-10 px-8 sm:px-16 md:px-20 ${playfair.className}`}>
              <div className={`flex-1 flex flex-col justify-center transition-all duration-500 ${showText ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-4'}`}>
                {letterPages[currentPage].split('\n').map((line, index) => {
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
