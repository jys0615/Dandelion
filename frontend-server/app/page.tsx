"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Send, Upload, ArrowLeft, ArrowRight, BookOpen } from "lucide-react"
import Image from "next/image"
import FaceBlurProcessor from "@/components/FaceBlurProcessor"
import { createBookmarklet } from '@/lib/api'
interface UserAnswer {
  questionId: string
  question: string
  answer: string
  timestamp: Date
}

interface FormData {
  complaintType: string
  location: string
  date: string
  time: string
  phone: string
  phoneNumber: string
  verificationCode: string
  name: string
  title: string
  content: string
  vehicleNumber: string
  shareContent: string
  personalInfoType: string
  email: string
  privacyConsent: string
  photos: File[]
  publicStatus: string
  notificationMethod: string
  sameComplaint: string
  notesAgreement: string
  privacyAgreement: string
}

interface Question {
  id: string
  question: string
  subtitle?: string
  inputType: "text" | "textarea" | "file" | "date" | "time" | "phone" | "select"
  placeholder?: string
  field: keyof FormData
  options?: string[]
}

const INITIAL_QUESTION: Question = {
  id: "situation-input",
  question:
    "안녕하세요! 동대문구 민원 도우미입니다. 어떤 상황이신지 자유롭게 말씀해 주세요.\n상황을 분석하여 가장 적합한 민원 창구를 안내해드리겠습니다.",
  subtitle: "예: 불법주차 차량을 신고하고 싶어요\n예: 소음 문제로 고민이에요",
  inputType: "textarea",
  placeholder: "예: 불법주차 차량을 신고하고 싶어요\n예: 소음 문제로 고민이에요",
  field: "complaintType",
}

const VIOLATION_TYPE_OPTIONS = [
  "교통위반(고속도로 포함)",
  "이륜차 위반",
  "난폭/보복운전",
  "버스전용차로 위반(고속도로제외)",
  "번호판 규정 위반",
  "불법등화, 반사판(지) 가림·손상",
  "불법 튜닝, 해체, 조작",
  "기타 자동차 안전기준 위반"
]

const SAFETY_REPORT_QUESTIONS: Question[] = [
  {
    id: "photos",
    question: "사진/동영상을 업로드해 주세요.\n이곳을 터치 또는 파일을 드래그 하세요.",
    inputType: "file",
    field: "photos",
  },
  {
    id: "location",
    question: "신고 발생 지역을 알려주세요.\n위치 찾기를 이용하여 대략의 주소를 검색해 주세요.",
    inputType: "text",
    placeholder: "서울특별시 중구 시청로 161",
    field: "location",
  },
  {
    id: "title",
    question: "제목을 입력해 주세요.",
    inputType: "text",
    placeholder: "최소 2자, 최대 150자 작성 가능",
    field: "title",
  },
  {
    id: "content",
    question: "신고 내용을 자세히 작성해 주세요.",
    inputType: "textarea",
    placeholder:
      "자동차·교통 위반 사항을 신고해 주세요.(이 메뉴에 불법 주정차를 신고하면 요건이 충족되지 않아 과태료 부과가 안 될 수 있습니다.)",
    field: "content",
  },
  {
    id: "vehicle-number",
    question: "차량 번호를 입력해 주세요.",
    inputType: "text",
    placeholder: "차량 번호 입력",
    field: "vehicleNumber",
  },
  {
    id: "date",
    question: "발생 일자를 입력해 주세요.",
    inputType: "date",
    field: "date",
  },
  {
    id: "time",
    question: "발생 시각을 입력해 주세요.",
    inputType: "time",
    field: "time",
  },
  {
    id: "phone",
    question: "휴대전화 번호를 입력해 주세요.",
    inputType: "phone",
    placeholder: "010-1234-5678",
    field: "phone",
  },
  {
    id: "verification",
    question: "인증 번호를 입력해 주세요.",
    inputType: "text",
    placeholder: "인증번호 6자리",
    field: "verificationCode",
  },
  {
    id: "share-content",
    question: "신고 내용 공유에 동의하시겠습니까?\n\n공유에 동의하시면 신고 내용과 답변내용이 신고업무 처리나 정부정책에 반영하기 위해 다른 행정기관에 제공 될 수 있으며, 필요 시 행정기관등의 홈페이지를 통해 일반국민들에게 신고 사례로 제공 될 수 있습니다.",
    inputType: "select",
    field: "shareContent",
    options: ["예", "아니요"],
  },
  {
    id: "personal-info",
    question: "인적 사항을 입력해 주세요.\n\n인적 사항(성명 등) 미입력 시 처리 기관의 신고 이력 관리, 진행 사항 통보, 처리 등 업무에 제약을 받을 수 있습니다. 「민원처리에 관한 법률」 시행령 제2조 제1항",
    inputType: "select",
    field: "personalInfoType",
    options: ["개인", "기관", "단체·기업"],
  },
  {
    id: "name",
    question: "이름을 입력해 주세요.\n(주민등록상 기재된 실명을 입력해 주세요.)",
    inputType: "text",
    placeholder: "홍길동",
    field: "name",
  },
  {
    id: "email",
    question: "이메일 주소를 입력해 주세요.",
    inputType: "text",
    placeholder: "example@email.com",
    field: "email",
  },
  {
    id: "privacy-consent",
    question: "개인정보 수집 동의에 동의하시겠습니까?",
    inputType: "select",
    field: "privacyConsent",
    options: ["예", "아니요"],
  },
]

const DONGDAEMUN_REPORT_QUESTIONS: Question[] = [
  {
    id: "title",
    question: "제목을 입력해 주세요.",
    inputType: "text",
    placeholder: "최소 2자, 최대 150자 작성 가능",
    field: "title",
  },
  {
    id: "public-status",
    question: "공개여부를 선택해 주세요.",
    inputType: "select",
    field: "publicStatus",
    options: ["공개", "비공개", "내용공개"],
  },
  {
    id: "address",
    question: "주소를 입력해 주세요.",
    inputType: "text",
    placeholder: "주소 검색을 이용해 주세요",
    field: "location",
  },
  {
    id: "email",
    question: "전자우편주소를 입력해 주세요.",
    inputType: "text",
    placeholder: "example@email.com",
    field: "email",
  },
  {
    id: "mobile-phone",
    question: "휴대폰 번호를 입력해 주세요.\n'-'을 제외한 휴대폰번호 숫자만 입력해 주세요.",
    inputType: "phone",
    placeholder: "01012345678",
    field: "phone",
  },
  {
    id: "phone-number",
    question: "전화번호를 입력해 주세요.\n'-'을 제외한 전화번호 숫자만 입력해 주세요.",
    inputType: "phone",
    placeholder: "0212345678",
    field: "phoneNumber",
  },
  {
    id: "notification-method",
    question: "별도 결과통지여부를 선택해 주세요.",
    inputType: "select",
    field: "notificationMethod",
    options: ["게시판 답변", "전자우편(E-MAIL)", "휴대전화 문자메시지(SMS)"],
  },
  {
    id: "same-complaint",
    question: "동일 고충민원여부를 확인해 주세요.",
    inputType: "select",
    field: "sameComplaint",
    options: ["동일 민원 없음", "동일 민원 있음"],
  },
  {
    id: "content",
    question: "내용을 자세히 작성해 주세요.",
    inputType: "textarea",
    placeholder: "민원 내용을 자세히 작성해 주세요.",
    field: "content",
  },
  {
    id: "attachments",
    question: "첨부파일을 업로드해 주세요.\n최대 5MByte, 한글 파일명 사용 시 오류가 발생할 수 있습니다.",
    inputType: "file",
    field: "photos",
  },
  {
    id: "privacy-consent-dongdaemun",
    question: "개인정보 수집 및 이용에 동의하시겠습니까?",
    inputType: "select",
    field: "privacyConsent",
    options: ["동의함", "동의하지 않음"],
  },
]

const MAYOR_REQUEST_QUESTIONS: Question[] = [
  {
    id: "notes-agreement",
    question: "유의사항",
    subtitle: "구민의 관심과 참여로 함께 하는 열린행정구현! 구민 여러분과 소통하는 소중한 의견을 듣습니다.\n\n• 누구든지 정보통신망을 통하여 사람을 비방하거나 욕설 등 불건전한 내용을 게시하거나 배포 하면 \"정보통신망 이용촉진 및 정보보호 등에 관한 법률 제70조 내지 제74조에 따라 처벌 받을 수 있습니다.\n• 게시판의 건전한 운영을 위해 불건전한 자료나 민원으로 부적합하다고 판단되는 의견은 \"서울특별시 동대문구 정보화 기본조례 제38조\"에 따라 삭제 될 수 있습니다.\n• 30분이상 페이지요청이 없는 경우 보안정책상 자동로그아웃 됩니다. 이에 게시글 등록이 안되시는 경우, 개인PC에 작성하신 내용을 따로 저장한 후 다시 로그인하여 등록해주시기 바랍니다.",
    inputType: "select",
    field: "notesAgreement",
    options: ["유의사항을 확인하였습니다."],
  },
  {
    id: "privacy-agreement",
    question: "개인정보 수집 및 이용 동의",
    subtitle: "1. 동대문구 홈페이지 민원(상담,의견,신고) 등록과 관련하여 개인정보보호법에 의거 본인의 개인정보를 아래와 같이 활용하는데 동의합니다.\n\n가. 수집하는 개인정보의 항목\n1. 개인정보 수집이용 내역(민원통합상담창구)\n\n수집하는 개인정보의 항목 - 수집항목, 수집·이용목적, 보유기간 항목으로 구성된 표입니다\n수집항목   수집·이용목적   보유기간\n신청자 정보   필수: 이름, 휴대전화번호, 휴대전화 문자알림 여부, 주소, 공개여부\n선택: 이메일주소   - 민원(상담, 의견, 신고)확인 및 처리   본 서비스 종료 시까지\n위의 개인정보 수집·이용에 대한 동의를 거부할 권리가 있습니다. 그러나 동의를 거부할 경우 경우 글 등록이 제한됩니다.\n\n2. 수집된 개인정보는 위 목적 이외의 용도로는 이용되지 않으며, 제3자에게 제공하지 않습니다.",
    inputType: "select",
    field: "privacyAgreement",
    options: ["개인정보 수집 및 이용에 동의합니다."],
  },
  {
    id: "mobile-phone",
    question: "휴대전화를 입력해 주세요.",
    inputType: "text",
    placeholder: "010-1234-5678",
    field: "phone",
  },
  {
    id: "email",
    question: "이메일을 입력해 주세요.",
    inputType: "text",
    placeholder: "example@email.com",
    field: "email",
  },
  {
    id: "title",
    question: "제목을 입력해 주세요.",
    inputType: "text",
    placeholder: "최소 2자, 최대 150자 작성 가능",
    field: "title",
  },
  {
    id: "content",
    question: "민원 내용을 자세히 작성해 주세요.",
    inputType: "textarea",
    placeholder: "민원 내용을 자세히 작성해 주세요.",
    field: "content",
  },
  {
    id: "attachments",
    question: "첨부파일을 업로드해 주세요.",
    subtitle: "최대 5MByte, 한글 파일명 사용 시 오류가 발생할 수 있습니다.\n\n업로드된 파일은 개인정보 보호용으로 자동 변환되어 민감한 정보가 제거됩니다. 제출할 파일을 선택해 주세요.",
    inputType: "file",
    field: "photos",
  },
  {
    id: "text-notification",
    question: "휴대전화 문자알림을 선택해 주세요.",
    inputType: "select",
    field: "notificationMethod",
    options: ["신청", "신청안함"],
  },
  {
    id: "public-disclosure",
    question: "공개여부를 선택해 주세요.",
    inputType: "select",
    field: "publicStatus",
    options: ["공개", "비공개"],
  },
]

export default function ComplaintChatbot() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
  const [currentInput, setCurrentInput] = useState("")
  const [formData, setFormData] = useState<FormData>({
    complaintType: "",
    location: "",
    date: "",
    time: "",
    phone: "",
    phoneNumber: "",
    verificationCode: "",
    name: "",
    title: "",
    content: "",
    vehicleNumber: "",
    shareContent: "",
    personalInfoType: "",
    email: "",
    privacyConsent: "",
    photos: [],
    publicStatus: "",
    notificationMethod: "",
    sameComplaint: "",
    notesAgreement: "",
    privacyAgreement: "",
  })
  const [isTyping, setIsTyping] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [isCompleted, setIsCompleted] = useState(false)
  const [slideDirection, setSlideDirection] = useState<"left" | "right">("right")
  const [questions, setQuestions] = useState<Question[]>([INITIAL_QUESTION])
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([])
  const [showAnswerReview, setShowAnswerReview] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([])
  const [isProcessingImage, setIsProcessingImage] = useState(false)
  const [situationAnalysis, setSituationAnalysis] = useState<string>("")
  const [recommendedService, setRecommendedService] = useState<string>("")
  const [recommendedViolationType, setRecommendedViolationType] = useState<string>("")
  const [selectedImage, setSelectedImage] = useState<string | null>(null)
  const [showFaceBlurProcessor, setShowFaceBlurProcessor] = useState(false)

  const fileInputRef = useRef<HTMLInputElement>(null)

  const [bookmarklet, setBookmarklet] = useState<{ url: string; code: string } | null>(null)
  const [isGenerating, setIsGenerating] = useState(false)
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  // ----- Clipboard helpers (robust with fallback) -----
  // Adds robust clipboard support for copying text, using the Clipboard API if available
  // and falling back to a hidden textarea and execCommand for broader browser compatibility.
  const canUseClipboard =
    typeof window !== 'undefined' &&
    typeof navigator !== 'undefined' &&
    (window.isSecureContext ?? false) &&
    !!(navigator as any).clipboard &&
    typeof (navigator as any).clipboard.writeText === 'function';

  const copyText = async (text: string) => {
    try {
      if (canUseClipboard) {
        await (navigator as any).clipboard.writeText(text);
      } else {
        // Fallback for non-secure contexts or missing API
        const ta = document.createElement('textarea');
        ta.value = text;
        ta.style.position = 'fixed';
        ta.style.opacity = '0';
        document.body.appendChild(ta);
        ta.focus();
        ta.select();
        document.execCommand('copy');
        document.body.removeChild(ta);
      }
      alert('복사되었습니다.');
    } catch (e) {
      console.error('클립보드 복사 실패:', e);
      alert('복사에 실패했습니다. 브라우저 권한을 확인해 주세요.');
    }
  };
  // ----------------------------------------------------

  const currentQuestion = questions[currentQuestionIndex]

  const moveToNextQuestion = (answer: string) => {
    setUserAnswers((prev) => [
      ...prev.filter((a) => a.questionId !== currentQuestion.id),
      {
        questionId: currentQuestion.id,
        question: currentQuestion.question,
        answer: answer,
        timestamp: new Date(),
      },
    ])

    setFormData((prev) => ({
      ...prev,
      [currentQuestion.field]: answer,
    }))

    setIsTyping(true)
    setShowOptions(false)

    setTimeout(() => {
      setIsTyping(false)
      setSlideDirection("right")

      if (currentQuestion.id === "situation-input") {
        const analysis = analyzeSituation(answer)
        setSituationAnalysis(analysis.reason)
        setRecommendedService(analysis.service)
        setRecommendedViolationType(analysis.violationType)

        setQuestions((prev) => [
          ...prev,
          {
            id: "service-recommendation",
            question: `상황을 분석한 결과: "${analysis.reason}" 추천 민원 창구: ${analysis.service} 계속 진행하시겠습니까?`,
            inputType: "select",
            field: "complaintType",
            options: [`${analysis.service} 선택`, "동대문구 새올 전자민원창구", "구청장에게 바란다"],
          },
        ])
        setCurrentQuestionIndex(1)
      } else if (currentQuestion.id === "service-recommendation") {
        if (answer.includes("안전신문고")) {
          // AI가 추천한 신고 유형을 첫 번째 옵션으로 하는 동적 질문 생성
          const violationTypeQuestion: Question = {
            id: "violation-type",
            question: `자동차·교통 위반 신고 유형을 선택해 주세요.\n\nAI가 분석한 결과, "${recommendedViolationType}"이 가장 적합한 것으로 판단됩니다.`,
            inputType: "select",
            field: "complaintType",
            options: [
              recommendedViolationType, // AI 추천을 첫 번째로
              ...VIOLATION_TYPE_OPTIONS.filter(option => option !== recommendedViolationType) // 나머지 옵션들
            ],
          }
          setQuestions((prev) => [violationTypeQuestion, ...SAFETY_REPORT_QUESTIONS])
          setCurrentQuestionIndex(2)
        } else if (answer === "동대문구 새올 전자민원창구" || answer === "구청장에게 바란다") {
          if (answer === "동대문구 새올 전자민원창구") {
            setQuestions([INITIAL_QUESTION, ...DONGDAEMUN_REPORT_QUESTIONS])
            setCurrentQuestionIndex(3)
          } else if (answer === "구청장에게 바란다") {
            setQuestions([INITIAL_QUESTION, ...MAYOR_REQUEST_QUESTIONS])
            setCurrentQuestionIndex(1)
          }
        }
      } else if (currentQuestion.id === "unsupported") {
        setCurrentQuestionIndex(0)
        setQuestions([INITIAL_QUESTION])
        setFormData({
          complaintType: "",
          location: "",
          date: "",
          time: "",
          phone: "",
          phoneNumber: "",
          verificationCode: "",
          name: "",
          title: "",
          content: "",
          vehicleNumber: "",
          shareContent: "",
          personalInfoType: "",
          email: "",
          privacyConsent: "",
          photos: [],
          publicStatus: "",
          notificationMethod: "",
          sameComplaint: "",
          notesAgreement: "",
          privacyAgreement: "",
        })
        setSituationAnalysis("")
        setRecommendedService("")
      } else if (currentQuestionIndex < questions.length - 1) {
        setCurrentQuestionIndex((prev) => prev + 1)
      } else {
        setIsCompleted(true)
        setQuestions((prev) => [
          ...prev,
          {
            id: "completion",
            question:
              "민원 작성을 위한 준비가 완료되었습니다! 🎉\n수집된 정보를 바탕으로 안전신문고에서 민원을 작성하실 수 있습니다.\n초안이 작성 완료되었습니다.",
            inputType: "select",
            field: "complaintType",
            options: ["북마클릿 생성하기", "안전신문고 바로가기"],
          },
        ])
        setCurrentQuestionIndex((prev) => prev + 1)
      }

      setTimeout(() => {
        setShowOptions(true)
      }, 300)
    }, 1500)
  }

  const moveToPreviousQuestion = () => {
    if (currentQuestionIndex > 0) {
      setSlideDirection("left")
      setShowOptions(false)
      setTimeout(() => {
        const prevIndex = currentQuestionIndex - 1
        setCurrentQuestionIndex(prevIndex)
        const previousQuestion = questions[prevIndex]
        const previousAnswer = userAnswers.find((a) => a.questionId === previousQuestion.id)
        if (previousAnswer) {
          setCurrentInput(previousAnswer.answer)
        } else {
          setCurrentInput("")
        }
        setTimeout(() => setShowOptions(true), 300)
      }, 200)
    }
  }

  const moveToNextAnsweredQuestion = () => {
    if (currentQuestionIndex < questions.length - 1) {
      setSlideDirection("right")
      setShowOptions(false)
      setTimeout(() => {
        const nextIndex = currentQuestionIndex + 1
        setCurrentQuestionIndex(nextIndex)
        const nextQuestion = questions[nextIndex]
        const nextAnswer = userAnswers.find((a) => a.questionId === nextQuestion.id)
        if (nextAnswer) {
          setCurrentInput(nextAnswer.answer)
        } else {
          setCurrentInput("")
        }
        setTimeout(() => setShowOptions(true), 300)
      }, 200)
    }
  }

  const canMoveToNext = () => {
    return (
      currentQuestionIndex < questions.length - 1 &&
      userAnswers.some((a) => a.questionId === questions[currentQuestionIndex + 1]?.id)
    )
  }

  const handleSubmit = () => {
    if (!currentInput.trim() && currentQuestion.inputType !== "file") return
    if (currentQuestion.inputType === "select") return
    moveToNextQuestion(currentInput)
    setCurrentInput("")
  }

  const handleOptionSelect = (option: string) => {
    if (option === "안전신문고 바로가기") {
      window.open("https://www.safe182.go.kr/", "_blank")
      return
    }
    if (option === "북마클릿 생성하기") {
      // Stay on the same question and trigger generation
      handleGenerateBookmarklet()
      return
    }
    moveToNextQuestion(option)
  }

  const handleFileUpload = async (files: FileList | null) => {
    if (!files) return

    const fileArray = Array.from(files)
    setUploadedFiles(fileArray)

    // 이미지 파일이 있는지 확인
    const imageFile = fileArray.find(file => file.type.startsWith('image/'))
    
    if (imageFile) {
      // 이미지를 미리보기용으로 변환
      const reader = new FileReader()
      reader.onload = (e) => {
        setSelectedImage(e.target?.result as string)
        setShowFaceBlurProcessor(true)
      }
      reader.readAsDataURL(imageFile)
    } else {
      // 이미지가 없으면 바로 다음으로 진행
      const fileNames = fileArray.map((f) => f.name).join(", ")
      moveToNextQuestion(`${fileArray.length}개의 파일 업로드 완료: ${fileNames}`)
    }
  }

  const sendVerificationCode = () => {
    if (currentQuestion.id === "phone" && currentInput.trim()) {
      setTimeout(() => {
        alert(`${currentInput}로 인증번호가 발송되었습니다.`)
      }, 500)
    }
  }

  const analyzeSituation = (situation: string): { service: string; reason: string; violationType: string } => {
    const input = situation.toLowerCase()

    // 신고 유형별 키워드 분석
    const violationTypeKeywords = {
      "교통위반(고속도로 포함)": [
        "신호위반", "신호", "교통신호", "빨간불", "노란불", "초록불",
        "과속", "속도위반", "제한속도", "속도", "빠르게", "천천히",
        "고속도로", "고속", "도로", "교통", "운전", "차량"
      ],
      "이륜차 위반": [
        "오토바이", "이륜차", "바이크", "모터사이클", "스쿠터",
        "원동기", "이륜", "오토바이", "바이크"
      ],
      "난폭/보복운전": [
        "난폭운전", "보복운전", "위협", "협박", "폭력", "싸움",
        "추월", "급제동", "급출발", "위험운전", "과격", "공격적"
      ],
      "버스전용차로 위반(고속도로제외)": [
        "버스전용차로", "버스차로", "전용차로", "버스", "버스전용",
        "차로위반", "버스차로", "전용"
      ],
      "번호판 규정 위반": [
        "번호판", "차량번호", "번호", "판", "차량번호판",
        "번호판가림", "번호판손상", "번호판변조", "번호판위반"
      ],
      "불법등화, 반사판(지) 가림·손상": [
        "등화", "불법등화", "반사판", "가림", "손상", "조명",
        "불빛", "등", "램프", "헤드라이트", "브레이크등"
      ],
      "불법 튜닝, 해체, 조작": [
        "튜닝", "불법튜닝", "해체", "조작", "개조", "수정",
        "변경", "부품", "엔진", "배기관", "소음기"
      ],
      "기타 자동차 안전기준 위반": [
        "안전기준", "안전", "기준", "위반", "자동차", "차량",
        "안전장치", "브레이크", "타이어", "유리", "미러"
      ]
    }

    // 가장 적합한 신고 유형 찾기
    let bestMatch = "교통위반(고속도로 포함)"
    let maxScore = 0

    for (const [violationType, keywords] of Object.entries(violationTypeKeywords)) {
      const score = keywords.filter(keyword => input.includes(keyword)).length
      if (score > maxScore) {
        maxScore = score
        bestMatch = violationType
      }
    }

    // 기본 서비스 분석 (기존 로직 유지)
    const safetyKeywords = [
      "불법주차", "주차위반", "교통위반", "신호위반", "과속", "난폭운전",
      "보행자", "횡단보도", "안전", "사고", "위험", "교통", "차량",
      "운전", "도로", "포트홀", "신호등", "표지판", "가드레일",
    ]

    const dongdaemunKeywords = [
      "소음", "악취", "쓰레기", "환경", "위생", "건축", "공사",
      "상가", "시설물", "가로등", "공원", "놀이터", "복지", "민원",
    ]

    const seoulKeywords = ["서울시", "지하철", "버스", "대중교통", "시정", "정책", "제안"]

    let service = "안전신문고"
    let reason = "교통 및 안전 관련 신고는 안전신문고에서 처리됩니다."

    if (dongdaemunKeywords.some((keyword) => input.includes(keyword))) {
      service = "동대문구 새올 전자민원창구"
      reason = "동대문구 관할 생활민원은 새올 전자민원창구에서 처리됩니다."
    } else if (seoulKeywords.some((keyword) => input.includes(keyword))) {
              service = "구청장에게 바란다"
      reason = "서울시 전체 관련 민원은 응답소에서 처리됩니다."
    }

    return {
      service,
      reason,
      violationType: bestMatch
    }
  }
  const mapToApiPayload = () => {
    // 현재 플로우는 '구청장에게 바란다(DDM)' 기준 매핑
    return {
      system: "DDM",
      title: formData.title,
      content: formData.content,
      phone: formData.phone || formData.phoneNumber,
      email: formData.email,
      isPublic: formData.publicStatus === "공개" ? "Y" : "N",
      smsNotification:
        formData.notificationMethod === "신청" ||
        formData.notificationMethod === "휴대전화 문자메시지(SMS)"
          ? "Y"
          : "N",
    }
  }

  // Stores the generated bookmarklet URL and code after successful API response
  const handleGenerateBookmarklet = async () => {
    try {
      setErrorMsg(null)
      setIsGenerating(true)
      const payload = mapToApiPayload()
      const res = await createBookmarklet(payload as any)
      setBookmarklet({
        url: (res as any)?.bookmarkletUrl || "",
        code: (res as any)?.bookmarkletCode || "",
      })
    } catch (e: any) {
      setErrorMsg(e?.message || "생성 중 오류가 발생했습니다.")
    } finally {
      setIsGenerating(false)
    }
  }

  useEffect(() => {
    setTimeout(() => setShowOptions(true), 1000)
  }, [])

  const renderInputArea = () => {
    if (isTyping) {
      return (
        <div className="mb-6">
          <div className="flex items-center gap-1 p-3">
            <div className="flex gap-1">
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
              <div className="w-2 h-2 bg-primary/60 rounded-full animate-bounce"></div>
            </div>
            <span className="text-sm text-muted-foreground ml-2">AI 도우미가 입력 중...</span>
          </div>
        </div>
      )
    }

    if (currentQuestion.inputType === "select" && showOptions) {
      return (
        <div className="space-y-3">
          {currentQuestion.options?.map((option, index) => (
            <button
              key={option}
              onClick={() => handleOptionSelect(option)}
              className={`
                w-full p-4 text-left rounded-2xl border-2 transition-all duration-300
                bg-card hover:bg-card/80 border-border hover:border-primary/50
                shadow-md hover:shadow-lg transform hover:scale-[1.02] active:scale-[0.98]
                animate-fade-in-up font-medium text-foreground
              `}
              style={{ animationDelay: `${index * 150}ms` }}
            >
              <div className="flex items-center justify-between">
                <span className="text-sm">{option}</span>
                <ArrowRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </button>
          ))}
          {currentQuestion.id === "completion" && (
            <div className="mt-4 space-y-3 animate-fade-in-up">
              {isGenerating && (
                <div className="p-3 rounded-xl border bg-card text-sm">
                  북마클릿을 생성 중입니다...
                </div>
              )}
              {errorMsg && (
                <div className="p-3 rounded-xl border border-red-300 bg-red-50 text-red-700 text-sm">
                  {errorMsg}
                </div>
              )}
              {bookmarklet && (
                <div className="p-3 rounded-2xl border bg-card space-y-3">
                  <div className="text-sm font-medium">북마클릿이 준비되었습니다.</div>

                  {/* 
                    Bookmarklet drag-and-drop block:
                    The <a> tag below is made draggable and sets multiple MIME types (text/uri-list, text/plain, text/html)
                    and a visible label for better browser compatibility and user experience when dragging to the bookmarks bar.
                  */}
                  <a
                    href={bookmarklet.url}
                    onClick={(e) => e.preventDefault()}
                    draggable
                    onDragStart={(e) => {
                      const url = bookmarklet.url;
                      const name = '구청장에게 바란다';
                      try {
                        // Set multiple MIME types for compatibility:
                        // - text/uri-list for most browsers/bookmark bars
                        // - text/plain as a fallback for some browsers
                        // - text/html with anchor text for browsers that use it as the bookmark label
                        e.dataTransfer?.setData('text/uri-list', url);
                        e.dataTransfer?.setData('text/plain', url);
                        e.dataTransfer?.setData('text/html', `<a href="${url}">${name}</a>`);
                        // Set drag effect to 'copy' to indicate bookmark creation
                        e.dataTransfer.effectAllowed = 'copy';
                      } catch (_) {}
                    }}
                    // select-none prevents text selection while dragging the link
                    className="block w-full text-center px-4 py-3 rounded-xl border-2 border-dashed hover:border-primary/60 hover:bg-card/80 transition-all text-sm font-medium select-none"
                    title="이 링크를 북마크바로 끌어다 놓으세요"
                    aria-label="구청장에게 바란다 북마클릿"
                  >
                    🔖 구청장에게 바란다
                  </a>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => copyText(bookmarklet.url)}
                      className="flex-1 rounded-xl"
                    >
                      링크 복사
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => copyText(bookmarklet.code)}
                      className="flex-1 rounded-xl"
                    >
                      코드 복사
                    </Button>
                  </div>

                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>북마크바가 보이지 않으면 <span className="font-mono">Ctrl/⌘ + Shift + B</span>로 표시하세요.</p>
                    <p>일부 브라우저/환경에서는 보안 정책 때문에 자동 복사가 제한될 수 있어요. 이 경우 드래그 저장을 이용해 주세요.</p>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )
    }

    if (currentQuestion.inputType === "file" && showOptions) {
      // 얼굴 블러 처리기가 표시되어야 하는 경우
      if (showFaceBlurProcessor && selectedImage) {
        return (
          <div className="animate-fade-in-up space-y-4">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="font-semibold text-blue-900 mb-2">🔒 개인정보 보호 처리</h3>
              <p className="text-sm text-blue-800">
                업로드된 이미지에서 얼굴을 자동으로 감지하여 블러 처리합니다. 
                처리된 이미지를 다운로드하여 민원 작성 시 사용하세요.
              </p>
            </div>
            
            <FaceBlurProcessor 
              imageSrc={selectedImage}
              onProcessingChange={setIsProcessingImage}
            />
            
            <div className="space-y-3">
              <Button
                onClick={() => {
                  setShowFaceBlurProcessor(false)
                  setSelectedImage(null)
                  setUploadedFiles([])
                }}
                className="w-full h-12 rounded-2xl shadow-lg bg-card text-foreground border-2 border-border font-medium hover:bg-card/80 hover:border-primary/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                다른 이미지 선택
              </Button>
              <Button
                onClick={() => {
                  setShowFaceBlurProcessor(false)
                  setSelectedImage(null)
                  const fileNames = uploadedFiles.map((f) => f.name).join(", ")
                  moveToNextQuestion(`${uploadedFiles.length}개의 파일 업로드 완료: ${fileNames}`)
                }}
                className="w-full h-12 rounded-2xl shadow-lg bg-card text-foreground border-2 border-border font-medium hover:bg-card/80 hover:border-primary/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
              >
                다음 단계로 진행
              </Button>
            </div>
          </div>
        )
      }

      return (
        <div className="animate-fade-in-up space-y-4">
          <input
            ref={fileInputRef}
            type="file"
            multiple
            accept="image/*,video/*"
            onChange={(e) => handleFileUpload(e.target.files)}
            className="hidden"
          />
          <button
            onClick={() => fileInputRef.current?.click()}
            disabled={isProcessingImage}
            className="w-full h-32 border-dashed border-2 border-primary/30 hover:border-primary/50 rounded-2xl bg-card hover:bg-card/80 transition-all duration-300 flex flex-col items-center justify-center gap-3 shadow-md hover:shadow-lg disabled:opacity-50"
          >
            {isProcessingImage ? (
              <>
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
                <span className="font-medium text-foreground">개인정보 보호용으로 변환 중...</span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-primary" />
                <span className="text-sm font-medium text-foreground">파일 선택 또는 드래그</span>
                <span className="text-xs text-muted-foreground">개인정보 보호용으로 변환됩니다</span>
              </>
            )}
          </button>

          {uploadedFiles.length > 0 && (
            <div className="space-y-2">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center gap-3 p-3 bg-card rounded-xl border">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm font-medium">{file.name}</span>
                  <Badge variant="secondary" className="text-xs">
                    보호용
                  </Badge>
                </div>
              ))}
            </div>
          )}
        </div>
      )
    }

    if (currentQuestion.inputType === "textarea" && showOptions) {
      // 첫 화면(상황 입력)에서는 관련 법령 섹션을 표시하지 않음
      if (currentQuestion.id === "situation-input") {
        return (
          <div className="space-y-3 animate-fade-in-up">
            <div className="space-y-3">
              <textarea
                value={currentInput}
                onChange={(e) => setCurrentInput(e.target.value)}
                placeholder={currentQuestion.placeholder || "상황을 자세히 설명해 주세요..."}
                className="w-full h-32 p-4 text-sm rounded-2xl border-2 focus:border-primary/50 resize-none bg-card"
                onKeyDown={(e) => {
                  if (e.key === "Enter" && e.ctrlKey) {
                    handleSubmit()
                  }
                }}
              />
              <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
                <span className="font-semibold">Ctrl + Enter로 전송</span>
                <span className="font-mono bg-primary/10 px-3 py-1 rounded-full text-primary">
                  {currentInput.length}/500
                </span>
              </div>
              <Button
                onClick={handleSubmit}
                className="w-full h-12 rounded-2xl shadow-lg"
                disabled={!currentInput.trim()}
              >
                <Send className="h-4 w-4 mr-2" />
                <span className="text-sm">상황 분석하기</span>
              </Button>
            </div>
          </div>
        )
      }

      // 신고 내용 작성 화면에서만 관련 법령 섹션 표시
      const relatedLaws = [
        {
          title: "장애인·노인·임산부 등의 편의증진 보장에 관한 법률 제9조 제2항",
          content: "공공기관은 전체 주차 면적의 2% 이상을 장애인 전용 주차구역으로 설치하여야 한다.",
          draft: "해당 공공기관의 주차장에서 장애인 전용 주차구역이 전체 주차 면적의 2% 미만으로 설치되어 있어 「장애인·노인·임산부 등의 편의증진 보장에 관한 법률」 제9조 제2항을 위반하고 있습니다. 장애인 전용 주차구역을 법정 비율에 맞게 확충하여 장애인의 편의를 보장해 주시기 바랍니다."
        },
        {
          title: "도로교통법 제32조 제1항",
          content: "모든 차의 운전자는 교통안전표지가 표시하는 지시에 따라야 한다.",
          draft: "해당 차량이 교통안전표지(신호등, 도로표지 등)를 준수하지 않고 운행하여 「도로교통법」 제32조 제1항을 위반하고 있습니다. 교통안전표지를 준수하여 안전한 교통질서를 유지해 주시기 바랍니다."
        },
        {
          title: "도로교통법 제43조 제1항",
          content: "모든 차의 운전자는 제한속도를 초과하여 운전하여서는 아니 된다.",
          draft: "해당 차량이 제한속도를 초과하여 운전하여 「도로교통법」 제43조 제1항을 위반하고 있습니다. 제한속도를 준수하여 안전한 운전을 해 주시기 바랍니다."
        },
        {
          title: "도로교통법 제44조",
          content: "모든 차의 운전자는 안전거리를 확보하여야 한다.",
          draft: "해당 차량이 안전거리를 확보하지 않고 운전하여 「도로교통법」 제44조를 위반하고 있습니다. 안전거리를 확보하여 교통사고를 예방해 주시기 바랍니다."
        },
        {
          title: "도로교통법 제45조",
          content: "모든 차의 운전자는 앞지르기를 할 때에는 안전한 방법과 절차에 따라야 한다.",
          draft: "해당 차량이 안전한 방법과 절차를 준수하지 않고 앞지르기를 하여 「도로교통법」 제45조를 위반하고 있습니다. 안전한 앞지르기 방법을 준수해 주시기 바랍니다."
        }
      ]

      const handleLawClick = (law: typeof relatedLaws[0]) => {
        setCurrentInput(law.draft)
      }

      return (
        <div className="space-y-3 animate-fade-in-up">
          {/* 관련 법령 섹션 */}
                      <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 animate-fade-in-up w-full">
            <h4 className="text-sm font-semibold text-blue-900 mb-3 flex items-center gap-2 animate-fade-in-up" style={{ animationDelay: '0ms' }}>
              <BookOpen className="h-4 w-4" />
              관련 법령 참고
            </h4>
            <div className="space-y-2">
              {relatedLaws.map((law, index) => (
                <button
                  key={index}
                  onClick={() => handleLawClick(law)}
                  className="w-full text-left p-3 bg-white/80 hover:bg-white border border-blue-200/50 hover:border-blue-300 rounded-xl transition-all duration-200 hover:shadow-sm animate-fade-in-up"
                  style={{ 
                    animationDelay: `${index * 150}ms`,
                    animationFillMode: 'both'
                  }}
                >
                  <div className="text-xs font-medium text-blue-800 mb-1">{law.title}</div>
                  <div className="text-xs text-blue-700 leading-relaxed">{law.content}</div>
                  <div className="text-xs text-blue-600 mt-2 font-medium">클릭하여 초안 작성 →</div>
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-3">
            <textarea
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={currentQuestion.placeholder || "상황을 자세히 설명해 주세요..."}
              className="w-full h-32 p-4 text-sm rounded-2xl border-2 focus:border-primary/50 resize-none bg-card"
              onKeyDown={(e) => {
                if (e.key === "Enter" && e.ctrlKey) {
                  handleSubmit()
                }
              }}
            />
            <div className="flex justify-between items-center text-xs text-muted-foreground w-full">
              <span className="font-semibold">Ctrl + Enter로 전송</span>
              <span className="font-mono bg-primary/10 px-3 py-1 rounded-full text-primary">
                {currentInput.length}/500
              </span>
            </div>
            <Button
              onClick={handleSubmit}
              className="w-full h-12 rounded-2xl shadow-lg"
              disabled={!currentInput.trim()}
            >
              <Send className="h-4 w-4 mr-2" />
              <span className="text-sm">내용 작성 완료</span>
            </Button>
          </div>
        </div>
      )
    }

    if (!["select", "file", "textarea"].includes(currentQuestion.inputType) && showOptions) {
      return (
        <div className="space-y-3 animate-fade-in-up">
          <div className="flex gap-3">
            <Input
              value={currentInput}
              onChange={(e) => setCurrentInput(e.target.value)}
              placeholder={currentQuestion.placeholder || "답변을 입력하세요..."}
              className="flex-1 h-12 sm:h-14 text-sm rounded-2xl border-2 focus:border-primary/50"
              type={
                currentQuestion.inputType === "date"
                  ? "date"
                  : currentQuestion.inputType === "time"
                    ? "time"
                    : currentQuestion.inputType === "phone"
                      ? "tel"
                      : "text"
              }
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSubmit()
                }
              }}
            />
            <Button
              onClick={handleSubmit}
              size="icon"
              className="h-12 sm:h-14 w-12 sm:w-14 rounded-2xl shadow-lg"
              disabled={!currentInput.trim()}
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" />
            </Button>
          </div>

          {currentQuestion.inputType === "phone" && currentInput.trim() && (
            <Button onClick={sendVerificationCode} variant="outline" className="w-full rounded-2xl bg-transparent">
              인증번호 발송
            </Button>
          )}
        </div>
      )
    }

    return null
  }

  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-background via-background to-muted/20">
      {/* Header */}
      <div className="bg-gradient-to-br from-primary via-primary to-secondary text-primary-foreground p-6 shadow-xl relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent animate-pulse"></div>
                  <div className="flex items-center justify-between relative z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center p-1 shadow-lg border border-white/20">
              <Image
                src="/dongdaemun-logo.png"
                alt="동대문구 로고"
                width={32}
                height={32}
                className="object-contain"
                priority
              />
            </div>
            <div>
              <h1 className="font-bold text-base tracking-tight">동대문구 스마트 민원 서비스</h1>
              <p className="text-xs opacity-90 font-medium">AI가 민원 작성을 쉽고 빠르게 도와드립니다</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {isCompleted && userAnswers.length > 0 && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowAnswerReview(!showAnswerReview)}
                className="text-white hover:bg-white/20 transition-all duration-200 text-xs"
              >
                답변 확인 ({userAnswers.length})
              </Button>
            )}
          </div>
        </div>

        {showAnswerReview && (
          <div className="mt-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20 max-h-40 overflow-y-auto">
            <h3 className="font-semibold text-sm mb-3">입력한 답변들</h3>
            <div className="space-y-2">
              {userAnswers.map((answer, index) => (
                <div key={index} className="text-xs bg-white/10 rounded-lg p-2">
                  <div className="font-medium opacity-90">{answer.question.split("\n")[0]}</div>
                  <div className="text-white/80 mt-1">{answer.answer}</div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Question Slide Container */}
      <div className="flex-1 relative overflow-y-auto">
        <div
          className={`w-full h-full transition-transform duration-500 ease-out ${
            slideDirection === "right" ? "animate-slide-in-right" : "animate-slide-in-left"
          }`}
          key={currentQuestionIndex}
        >
          <div className="min-h-full flex flex-col justify-center p-4 sm:p-6 w-full max-w-[800px] mx-auto">
            {/* Question */}
                          <div className="space-y-4">
                <div className="flex items-center gap-6 mb-6 animate-fade-in w-full">
                <div className="flex flex-col items-center gap-2 flex-shrink-0">
                  <div className="w-20 h-20 bg-gradient-to-br from-primary to-secondary rounded-full flex items-center justify-center shadow-lg border-2 border-white/20 p-1">
                    <Image
                      src="/dongdaemun-mascot.png"
                      alt="동대문구 마스코트"
                      width={72}
                      height={72}
                      className="object-contain"
                      priority
                    />
                  </div>
                  <Badge
                    variant="outline"
                    className="text-xs font-medium px-3 py-1 bg-gradient-to-r from-primary/10 to-secondary/10 text-primary border-primary/20 shadow-sm"
                  >
                    AI 도우미
                  </Badge>
                </div>

                <div className="flex-1 space-y-4">
                  <h2 className="text-xl font-semibold text-gray-900 leading-relaxed whitespace-pre-wrap" style={{ whiteSpace: 'pre-wrap' }}>
                    {currentQuestion.question}
                  </h2>
                  {currentQuestion.subtitle && (
                    currentQuestion.id === "privacy-agreement" ? (
                      <div className="max-h-60 overflow-y-auto bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 animate-fade-in-up">
                        <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{currentQuestion.subtitle}</p>
                      </div>
                    ) : currentQuestion.id === "notes-agreement" ? (
                      <div className="bg-blue-50/50 border border-blue-200/50 rounded-2xl p-4 animate-fade-in-up">
                        <p className="text-sm text-blue-900 leading-relaxed whitespace-pre-wrap">{currentQuestion.subtitle}</p>
                      </div>
                    ) : (
                      <p className="text-sm text-gray-600 leading-relaxed whitespace-pre-wrap">{currentQuestion.subtitle}</p>
                    )
                  )}
                </div>


              </div>

              {/* Input Area */}
              <div className="space-y-4">{renderInputArea()}</div>
              
              {/* Navigation Buttons */}
              {(currentQuestionIndex > 0 || canMoveToNext()) && !isCompleted && (
                <div className="flex items-center gap-3 justify-center mt-6">
                  {currentQuestionIndex > 0 && (
                    <button onClick={moveToPreviousQuestion} className="nav-bubble flex items-center gap-2 group">
                      <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-0.5" />
                      <span className="font-medium">이전</span>
                    </button>
                  )}
                  {canMoveToNext() && (
                    <button onClick={moveToNextAnsweredQuestion} className="nav-bubble flex items-center gap-2 group">
                      <span className="font-medium">다음</span>
                      <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-0.5" />
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Progress Indicator */}
      {questions.length > 1 && !isCompleted && currentQuestionIndex > 0 && (
        <div className="bg-card/80 backdrop-blur-sm p-4 border-t border-border/50">
                      <div className="flex items-center justify-between text-sm text-muted-foreground mb-3 w-full max-w-[800px] mx-auto">
            <span className="font-semibold">진행률</span>
            <span className="font-mono bg-primary/10 px-3 py-1 rounded-full text-primary">
              {currentQuestionIndex}/{questions.length - 1}
            </span>
          </div>
          <div className="w-full bg-background rounded-full h-2 shadow-inner border border-border/30 w-full max-w-[800px] mx-auto">
            <div
              className="bg-gradient-to-r from-primary via-secondary to-accent h-2 rounded-full transition-all duration-700 shadow-sm relative overflow-hidden"
              style={{
                width: `${(currentQuestionIndex / (questions.length - 1)) * 100}%`,
              }}
            >
              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent animate-pulse"></div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
