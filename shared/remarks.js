// 100 Professional Student Remarks for School Report Cards with dynamic {name}
export const REMARK_CATEGORIES = {
  positive: {
    id: "positive",
    label: "Positive Remarks",
    subcategories: [
      { id: "excellent", label: "Excellent Performance" },
      { id: "very_good", label: "Very Good Performance" },
      { id: "good", label: "Good Performance" },
    ],
  },
  improvement: {
    id: "improvement",
    label: "Improvement Remarks",
    subcategories: [
      { id: "average", label: "Average / Needs Improvement" },
      { id: "attendance_hw", label: "Attendance & Homework" },
    ],
  },
  personality: {
    id: "personality",
    label: "Personality & Co-Curricular",
    subcategories: [
      { id: "discipline", label: "Discipline & Behaviour" },
      { id: "creativity", label: "Creativity & Co-curricular" },
      { id: "communication", label: "Communication & Confidence" },
      { id: "overall_dev", label: "Personality & Overall Development" },
      { id: "motivational", label: "Motivational & Encouraging" },
    ],
  },
};

export const ALL_REMARKS = [
  // 1. Excellent Performance (1-10)
  { id: 1, master: "positive", sub: "excellent", text: "{name} is an outstanding student who consistently demonstrates academic excellence." },
  { id: 2, master: "positive", sub: "excellent", text: "{name} has shown exceptional understanding and mastery of the subjects." },
  { id: 3, master: "positive", sub: "excellent", text: "{name} is highly intelligent, confident and dedicated towards learning." },
  { id: 4, master: "positive", sub: "excellent", text: "{name} consistently achieves excellent results through hard work and determination." },
  { id: 5, master: "positive", sub: "excellent", text: "{name} is a bright learner with excellent academic potential." },
  { id: 6, master: "positive", sub: "excellent", text: "{name} demonstrates remarkable analytical and problem-solving skills." },
  { id: 7, master: "positive", sub: "excellent", text: "{name} is a role model for other students through discipline and performance." },
  { id: 8, master: "positive", sub: "excellent", text: "{name} always strives for excellence and achieves remarkable progress." },
  { id: 9, master: "positive", sub: "excellent", text: "{name} has an excellent grasp of concepts and applies knowledge effectively." },
  { id: 10, master: "positive", sub: "excellent", text: "{name} deserves appreciation for outstanding academic achievements." },

  // 2. Very Good Performance (11-20)
  { id: 11, master: "positive", sub: "very_good", text: "{name} is a sincere and hardworking student who performs very well." },
  { id: 12, master: "positive", sub: "very_good", text: "{name} demonstrates a strong understanding of concepts across subjects." },
  { id: 13, master: "positive", sub: "very_good", text: "{name} is consistent in studies and actively participates in classroom activities." },
  { id: 14, master: "positive", sub: "very_good", text: "{name} shows great enthusiasm and dedication towards academic tasks." },
  { id: 15, master: "positive", sub: "very_good", text: "{name} has maintained a very good standard of academic performance." },
  { id: 16, master: "positive", sub: "very_good", text: "{name} is an attentive learner with a positive approach towards education." },
  { id: 17, master: "positive", sub: "very_good", text: "{name} completes assignments regularly and maintains good academic progress." },
  { id: 18, master: "positive", sub: "very_good", text: "{name} displays excellent learning habits and responsible behaviour." },
  { id: 19, master: "positive", sub: "very_good", text: "{name} is progressing very well and should continue the same efforts." },
  { id: 20, master: "positive", sub: "very_good", text: "{name} has the ability to achieve even greater success through continued efforts." },

  // 3. Good Performance (21-30)
  { id: 21, master: "positive", sub: "good", text: "{name} is a good learner who shows interest in classroom activities." },
  { id: 22, master: "positive", sub: "good", text: "{name} has demonstrated satisfactory academic progress throughout the term." },
  { id: 23, master: "positive", sub: "good", text: "{name} is attentive and understands most concepts effectively." },
  { id: 24, master: "positive", sub: "good", text: "{name} completes assigned work with sincerity and responsibility." },
  { id: 25, master: "positive", sub: "good", text: "{name} is making good progress and should maintain consistency." },
  { id: 26, master: "positive", sub: "good", text: "{name} possesses good learning abilities and a positive attitude." },
  { id: 27, master: "positive", sub: "good", text: "{name} participates actively and shows interest in learning new things." },
  { id: 28, master: "positive", sub: "good", text: "{name} is capable of achieving better results with regular practice." },
  { id: 29, master: "positive", sub: "good", text: "{name} demonstrates a good balance of academics and co-curricular activities." },
  { id: 30, master: "positive", sub: "good", text: "{name} should continue working hard to achieve higher academic goals." },

  // 4. Average / Needs Improvement (31-40)
  { id: 31, master: "improvement", sub: "average", text: "{name} is making progress but needs to put in more consistent effort." },
  { id: 32, master: "improvement", sub: "average", text: "{name} should focus more on studies to improve academic performance." },
  { id: 33, master: "improvement", sub: "average", text: "{name} has the potential to perform better with regular practice." },
  { id: 34, master: "improvement", sub: "average", text: "{name} needs to develop better study habits and time management skills." },
  { id: 35, master: "improvement", sub: "average", text: "{name} should participate more actively in classroom discussions." },
  { id: 36, master: "improvement", sub: "average", text: "{name} needs to improve concentration and attention during lessons." },
  { id: 37, master: "improvement", sub: "average", text: "{name} is encouraged to complete all assignments on time." },
  { id: 38, master: "improvement", sub: "average", text: "{name} should revise lessons regularly to strengthen subject knowledge." },
  { id: 39, master: "improvement", sub: "average", text: "{name} needs additional practice to improve accuracy and confidence." },
  { id: 40, master: "improvement", sub: "average", text: "{name} can achieve better results through dedication and perseverance." },

  // 5. Discipline & Behaviour (41-50)
  { id: 41, master: "personality", sub: "discipline", text: "{name} is polite, respectful and well-mannered towards teachers and classmates." },
  { id: 42, master: "personality", sub: "discipline", text: "{name} maintains good discipline and follows school rules sincerely." },
  { id: 43, master: "personality", sub: "discipline", text: "{name} demonstrates honesty, responsibility and positive behaviour." },
  { id: 44, master: "personality", sub: "discipline", text: "{name} is cooperative and maintains healthy relationships with peers." },
  { id: 45, master: "personality", sub: "discipline", text: "{name} shows respect for others and contributes to a positive classroom environment." },
  { id: 46, master: "personality", sub: "discipline", text: "{name} should work on maintaining discipline and following instructions." },
  { id: 47, master: "personality", sub: "discipline", text: "{name} needs to develop greater self-control and responsibility." },
  { id: 48, master: "personality", sub: "discipline", text: "{name} is friendly, caring and helpful towards fellow students." },
  { id: 49, master: "personality", sub: "discipline", text: "{name} demonstrates good values and a responsible attitude." },
  { id: 50, master: "personality", sub: "discipline", text: "{name} should continue developing leadership qualities and positive behaviour." },

  // 6. Creativity & Co-curricular Activities (51-60)
  { id: 51, master: "personality", sub: "creativity", text: "{name} is creative and enthusiastically participates in various activities." },
  { id: 52, master: "personality", sub: "creativity", text: "{name} demonstrates excellent artistic and imaginative abilities." },
  { id: 53, master: "personality", sub: "creativity", text: "{name} actively participates in sports and extracurricular activities." },
  { id: 54, master: "personality", sub: "creativity", text: "{name} possesses good communication and presentation skills." },
  { id: 55, master: "personality", sub: "creativity", text: "{name} shows enthusiasm for exploring new ideas and experiences." },
  { id: 56, master: "personality", sub: "creativity", text: "{name} demonstrates leadership skills and team spirit." },
  { id: 57, master: "personality", sub: "creativity", text: "{name} is talented and shows interest in creative learning activities." },
  { id: 58, master: "personality", sub: "creativity", text: "{name} performs confidently in cultural and school events." },
  { id: 59, master: "personality", sub: "creativity", text: "{name} has a curious mind and enjoys practical learning experiences." },
  { id: 60, master: "personality", sub: "creativity", text: "{name} should explore more opportunities to showcase hidden talents." },

  // 7. Communication & Confidence (61-70)
  { id: 61, master: "personality", sub: "communication", text: "{name} communicates ideas clearly and confidently." },
  { id: 62, master: "personality", sub: "communication", text: "{name} is developing excellent speaking and presentation skills." },
  { id: 63, master: "personality", sub: "communication", text: "{name} should work on improving communication skills and classroom participation." },
  { id: 64, master: "personality", sub: "communication", text: "{name} expresses thoughts creatively and confidently." },
  { id: 65, master: "personality", sub: "communication", text: "{name} needs encouragement to participate more actively in discussions." },
  { id: 66, master: "personality", sub: "communication", text: "{name} demonstrates confidence while performing individual and group tasks." },
  { id: 67, master: "personality", sub: "communication", text: "{name} is becoming more expressive and independent in learning." },
  { id: 68, master: "personality", sub: "communication", text: "{name} should develop greater confidence in public speaking." },
  { id: 69, master: "personality", sub: "communication", text: "{name} listens attentively and responds appropriately during lessons." },
  { id: 70, master: "personality", sub: "communication", text: "{name} shows improvement in communication and interpersonal skills." },

  // 8. Attendance & Homework (71-80)
  { id: 71, master: "improvement", sub: "attendance_hw", text: "{name} maintains regular attendance and demonstrates commitment to learning." },
  { id: 72, master: "improvement", sub: "attendance_hw", text: "{name} should improve attendance to ensure continuous academic progress." },
  { id: 73, master: "improvement", sub: "attendance_hw", text: "{name} completes homework regularly and responsibly." },
  { id: 74, master: "improvement", sub: "attendance_hw", text: "{name} needs to be more regular in completing homework assignments." },
  { id: 75, master: "improvement", sub: "attendance_hw", text: "{name} is punctual and follows classroom routines sincerely." },
  { id: 76, master: "improvement", sub: "attendance_hw", text: "{name} should develop better punctuality and time management habits." },
  { id: 77, master: "improvement", sub: "attendance_hw", text: "{name} needs to take greater responsibility for daily academic tasks." },
  { id: 78, master: "improvement", sub: "attendance_hw", text: "{name} demonstrates consistency in classwork and homework." },
  { id: 79, master: "improvement", sub: "attendance_hw", text: "{name} should ensure regular revision and timely submission of assignments." },
  { id: 80, master: "improvement", sub: "attendance_hw", text: "{name} is encouraged to maintain regular attendance and active participation." },

  // 9. Personality & Overall Development (81-90)
  { id: 81, master: "personality", sub: "overall_dev", text: "{name} is an enthusiastic learner with a cheerful and positive personality." },
  { id: 82, master: "personality", sub: "overall_dev", text: "{name} demonstrates kindness, empathy and respect towards others." },
  { id: 83, master: "personality", sub: "overall_dev", text: "{name} is independent, responsible and eager to learn new skills." },
  { id: 84, master: "personality", sub: "overall_dev", text: "{name} shows curiosity and a willingness to explore new concepts." },
  { id: 85, master: "personality", sub: "overall_dev", text: "{name} is developing essential life skills and good moral values." },
  { id: 86, master: "personality", sub: "overall_dev", text: "{name} demonstrates teamwork, cooperation and a helpful attitude." },
  { id: 87, master: "personality", sub: "overall_dev", text: "{name} is a confident learner who accepts challenges positively." },
  { id: 88, master: "personality", sub: "overall_dev", text: "{name} shows remarkable improvement in personal and academic development." },
  { id: 89, master: "personality", sub: "overall_dev", text: "{name} has a positive mindset and a strong desire to succeed." },
  { id: 90, master: "personality", sub: "overall_dev", text: "{name} is encouraged to continue developing leadership and problem-solving abilities." },

  // 10. Motivational & Encouraging Remarks (91-100)
  { id: 91, master: "personality", sub: "motivational", text: "{name} has great potential; consistent efforts will lead to greater achievements." },
  { id: 92, master: "personality", sub: "motivational", text: "{name} should keep working hard and never stop exploring new possibilities." },
  { id: 93, master: "personality", sub: "motivational", text: "{name} is on the right path towards success; keep up the good work." },
  { id: 94, master: "personality", sub: "motivational", text: "{name} should believe in personal abilities and continue striving for excellence." },
  { id: 95, master: "personality", sub: "motivational", text: "{name} has shown encouraging progress and is capable of achieving more." },
  { id: 96, master: "personality", sub: "motivational", text: "{name} should turn challenges into opportunities for learning and growth." },
  { id: 97, master: "personality", sub: "motivational", text: "{name} is encouraged to remain focused, confident and determined." },
  { id: 98, master: "personality", sub: "motivational", text: "{name} has the ability to shine brighter with dedication and perseverance." },
  { id: 99, master: "personality", sub: "motivational", text: "{name} should continue learning with curiosity, confidence and enthusiasm." },
  { id: 100, master: "personality", sub: "motivational", text: "{name} is a promising learner with a bright future ahead. Keep shining!" },
];

export function formatRemark(itemOrText, studentName) {
  if (!itemOrText) return "";
  const raw =
    typeof itemOrText === "object"
      ? itemOrText.text || itemOrText.template || ""
      : String(itemOrText);
  if (!raw) return "";
  const name = String(studentName || "Student").trim();
  return raw
    .replaceAll("{name}", name)
    .replaceAll("{Name}", name)
    .replaceAll("{NAME}", name.toUpperCase());
}
