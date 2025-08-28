'use client'

import { useEffect, useRef, useState } from 'react'
import * as faceapi from 'face-api.js'

interface FaceBlurProcessorProps {
  imageSrc: string
  onProcessingChange: (processing: boolean) => void
}

interface FaceRegion {
  x: number
  y: number
  width: number
  height: number
}

export default function FaceBlurProcessor({ imageSrc, onProcessingChange }: FaceBlurProcessorProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [processedImage, setProcessedImage] = useState<string | null>(null)
  const [faces, setFaces] = useState<FaceRegion[]>([])
  const [isDetecting, setIsDetecting] = useState(false)
  const [modelsLoaded, setModelsLoaded] = useState(false)

  // face-api.js 모델 로드 (간소화)
  useEffect(() => {
    const loadModels = async () => {
      try {
        // 얼굴 감지만 필요한 경우 tinyFaceDetector만 로드
        await faceapi.nets.tinyFaceDetector.loadFromUri('/models')
        setModelsLoaded(true)
        console.log('모델 로드 완료!')
      } catch (error) {
        console.error('모델 로드 실패:', error)
        setModelsLoaded(true) // 에러가 있어도 계속 진행
      }
    }

    loadModels()
  }, [])

  // 얼굴 영역에 blur 적용
  const applyBlurToFaces = (canvas: HTMLCanvasElement, faces: FaceRegion[]) => {
    const ctx = canvas.getContext('2d')
    if (!ctx) return

    faces.forEach(face => {
      // 얼굴 영역을 최적화된 크기로 확장
      const expansion = Math.min(face.width * 0.15, 25)
      const expandedFace = {
        x: Math.max(0, face.x - expansion),
        y: Math.max(0, face.y - expansion),
        width: Math.min(face.width + expansion * 2, canvas.width - face.x),
        height: Math.min(face.height + expansion * 2, canvas.height - face.y)
      }

      // 얼굴 영역의 이미지 데이터 추출
      const imageData = ctx.getImageData(
        expandedFace.x, 
        expandedFace.y, 
        expandedFace.width, 
        expandedFace.height
      )

      // 최적화된 blur 적용
      const blurredData = applyBoxBlur(imageData, 20)
      
      // blur된 데이터를 다시 캔버스에 그리기
      ctx.putImageData(blurredData, expandedFace.x, expandedFace.y)
    })
  }

  // 박스 blur 알고리즘
  const applyBoxBlur = (imageData: ImageData, radius: number): ImageData => {
    const { data, width, height } = imageData
    const result = new Uint8ClampedArray(data.length)
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let r = 0, g = 0, b = 0, a = 0, count = 0
        
        // 주변 픽셀들의 평균 계산
        for (let dy = -radius; dy <= radius; dy++) {
          for (let dx = -radius; dx <= radius; dx++) {
            const nx = x + dx
            const ny = y + dy
            
            if (nx >= 0 && nx < width && ny >= 0 && ny < height) {
              const idx = (ny * width + nx) * 4
              r += data[idx]
              g += data[idx + 1]
              b += data[idx + 2]
              a += data[idx + 3]
              count++
            }
          }
        }
        
        const idx = (y * width + x) * 4
        result[idx] = r / count
        result[idx + 1] = g / count
        result[idx + 2] = b / count
        result[idx + 3] = a / count
      }
    }
    
    return new ImageData(result, width, height)
  }

  useEffect(() => {
    if (!imageSrc || !canvasRef.current || !modelsLoaded) return

    const processImage = async () => {
      setIsDetecting(true)
      onProcessingChange(true)

      const canvas = canvasRef.current!
      const ctx = canvas.getContext('2d')!
      
      const img = new Image()
      img.onload = async () => {
        canvas.width = img.width
        canvas.height = img.height
        ctx.drawImage(img, 0, 0)
        
        // face-api.js로 얼굴 인식 (에러 처리 추가)
        let detectedFaces: FaceRegion[] = []
        try {
          const detections = await faceapi.detectAllFaces(img, new faceapi.TinyFaceDetectorOptions())
          detectedFaces = detections.map(detection => ({
            x: detection.box.x,
            y: detection.box.y,
            width: detection.box.width,
            height: detection.box.height
          }))
          console.log('얼굴 감지:', detectedFaces.length, '개')
        } catch (error) {
          console.error('얼굴 인식 실패:', error)
          detectedFaces = [] // 빈 배열로 설정
        }

        setFaces(detectedFaces)
        
        applyBlurToFaces(canvas, detectedFaces)
        
        setProcessedImage(canvas.toDataURL('image/jpeg', 0.9))
        setIsDetecting(false)
        onProcessingChange(false)
      }
      
      img.src = imageSrc
    }

    processImage()
  }, [imageSrc, onProcessingChange, modelsLoaded])

  const downloadImage = () => {
    if (!processedImage) return
    
    const link = document.createElement('a')
    link.download = 'blurred-face.jpg'
    link.href = processedImage
    link.click()
  }

  return (
    <div className="space-y-4">
      {!modelsLoaded && (
        <div className="bg-yellow-50 border border-yellow-200 rounded p-4">
          <p className="text-yellow-800">🤖 AI 모델 로딩 중... 잠시만 기다려주세요!</p>
        </div>
      )}
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* 원본 이미지 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">원본 이미지</h3>
          <img 
            src={imageSrc} 
            alt="원본" 
            className="w-full h-auto border rounded"
          />
        </div>
        
        {/* 처리된 이미지 */}
        <div>
          <h3 className="text-lg font-semibold mb-2">
            처리된 이미지 {isDetecting && '(처리 중...)'}
          </h3>
          {processedImage ? (
            <div className="relative">
              <img 
                src={processedImage} 
                alt="처리됨" 
                className="w-full h-auto border rounded"
              />
              <div className="absolute top-2 right-2 bg-green-500 text-white px-2 py-1 rounded text-sm">
                {faces.length}개 얼굴 감지됨
              </div>
            </div>
          ) : (
            <div className="w-full h-64 bg-gray-100 border rounded flex items-center justify-center">
              {isDetecting ? '얼굴 인식 중...' : '처리 대기 중'}
            </div>
          )}
        </div>
      </div>

      {/* 얼굴 감지 결과 요약 */}
      {faces.length > 0 && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
            <span className="font-semibold text-green-800">
              {faces.length}개의 얼굴이 감지되어 블러 처리되었습니다
            </span>
          </div>
          <p className="text-sm text-green-700 mt-1">
            개인정보가 보호된 이미지를 다운로드하여 민원 작성에 사용하세요.
          </p>
        </div>
      )}

      {/* 액션 버튼들 */}
      {processedImage && (
        <div className="space-y-3">
          <button
            onClick={downloadImage}
            className="w-full h-12 rounded-2xl shadow-lg bg-card text-foreground border-2 border-border font-medium hover:bg-card/80 hover:border-primary/50 transition-all duration-200 transform hover:scale-[1.02] active:scale-[0.98]"
          >
            📥 처리된 이미지 다운로드
          </button>
        </div>
      )}

      {/* 숨겨진 캔버스 */}
      <canvas ref={canvasRef} className="hidden" />
    </div>
  )
}
