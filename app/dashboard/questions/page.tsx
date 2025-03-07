'use client';

import { Search, Bell, Pencil, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Image from "next/image"
import { useSearchParams, useRouter } from "next/navigation"
import { useEffect, useState, Suspense } from "react"
import { fetchPollById, type Poll, type Question } from "@/lib/services/poll"
import { Loader } from "@/components/ui/loader"
import Link from "next/link"
import { Modal } from "@/components/ui/modal"
import QuestionForm from "@/components/questionForm"
import { updateQuestion } from "@/lib/services/question"

// Create a client component that uses useSearchParams
function QuestionsContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const pollId = searchParams.get('pollId')
  
  const [poll, setPoll] = useState<Poll | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isQuestionModalOpen, setIsQuestionModalOpen] = useState(false)
  const [currentQuestion, setCurrentQuestion] = useState<Question | null>(null)

  useEffect(() => {
    // Check authentication
    const token = localStorage.getItem('token')
    if (!token) {
      router.push('/login')
      return
    }

    // Check if pollId exists
    if (!pollId) {
      setError('معرف الاستطلاع غير موجود')
      setLoading(false)
      return
    }

    // Fetch poll data
    const loadPoll = async () => {
      try {
        setLoading(true)
        const response = await fetchPollById(Number(pollId))
        setPoll(response.data || response)
      } catch (err) {
        console.error('Error fetching poll:', err)
        setError('فشل في تحميل بيانات الاستطلاع')
      } finally {
        setLoading(false)
      }
    }

    loadPoll()
  }, [pollId, router])

  // Handle editing a question
  const handleEditQuestion = (questionId: number) => {
    console.log('Edit question:', questionId)
    // Find the question with the matching ID
    const questionToEdit = poll?.questions.find(q => q.id === questionId)
    if (questionToEdit) {
      setCurrentQuestion(questionToEdit)
      setIsQuestionModalOpen(true)
    }
  }

  // Handle saving edited question
  const handleSaveQuestion = async (questionData: Question) => {
    try {
      if (!currentQuestion?.id) return
      
      // Call the updated updateQuestion function with just the question ID
      await updateQuestion(currentQuestion.id, questionData)
      
      // Refresh poll data to show the updated question
      const response = await fetchPollById(Number(pollId))
      setPoll(response.data || response)
      
      // Close modal
      setIsQuestionModalOpen(false)
      setCurrentQuestion(null)
    } catch (error) {
      console.error('Error saving question:', error)
    }
  }

  // Handle canceling question edit
  const handleCancelQuestionEdit = () => {
    setIsQuestionModalOpen(false)
    setCurrentQuestion(null)
  }

  if (loading) return <Loader />
  if (error) return <div className="flex h-screen items-center justify-center text-red-500">{error}</div>
  if (!poll) return <div className="flex h-screen items-center justify-center">الاستطلاع غير موجود</div>

  return (
    <div className="flex h-screen bg-gray-100">
      {/* Sidebar */}
      <div className="w-48 bg-[#1e1e2d] text-white">
        <div className="h-screen relative">
          <Image 
            src="/imag.png"
            alt="Logo"
            fill
            priority
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="bg-white p-4 shadow-sm flex justify-between items-center">
          {/* Search */}
          <div className="relative w-1/2">
            <Input placeholder="بحث..." className="pl-10 pr-4 py-2 w-full rounded-md border border-gray-300" />
            <Search className="absolute left-3 top-2.5 h-5 w-5 text-gray-400" />
          </div>

          {/* User Info */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <Button variant="ghost" size="icon" className="relative">
                <span className="sr-only">الإشعارات</span>
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 rounded-full text-[10px] text-white flex items-center justify-center">
                  1
                </div>
                <Bell className="h-6 w-6" />
              </Button>
            </div>
            <div className="text-right">
              <h3 className="font-bold">اسم المدير</h3>
              <p className="text-sm text-gray-500">مرحبا بك</p>
            </div>
            <div className="h-10 w-10 rounded-full bg-gray-200"></div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-1 p-6 overflow-auto" dir="rtl">
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <Link 
                  href="/dashboard" 
                  className="text-[#009688] hover:text-[#00796b] flex items-center gap-2 mb-2"
                >
                  <ArrowRight className="h-4 w-4" /> العودة للوحة التحكم
                </Link>
                <h1 className="text-2xl font-bold">تعديل أسئلة الاستطلاع: {poll.title}</h1>
                <p className="text-gray-600">{poll.description}</p>
              </div>
            </div>
            
            {poll.questions.map((question, index) => (
              <div key={question.id} className="bg-white rounded-lg shadow p-6">
                <div className="flex justify-between items-start mb-6">
                  <h2 className="text-xl font-bold">السؤال {index + 1}: {question.text}</h2>
                  <div className="flex gap-2">
                    
                    <button 
                      className="text-[#009688] hover:text-[#00796b]"
                      onClick={() => handleEditQuestion(question.id)}
                    >
                      <Pencil className="h-5 w-5" />
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4" dir="rtl">
                  {question.answers.map((answer, optionIndex) => (
                    <div key={answer.id} className="flex items-center space-x-2 space-x-reverse p-3 border border-gray-200 rounded-md">
                      <div className="bg-[#1e1e2d] text-white w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold shadow-sm mr-2">
                        {optionIndex + 1}
                      </div>
                      <div className="flex-1">
                        <p className="font-medium">{answer.text}</p>
                        <p className="text-sm text-gray-500">{answer.points} نقاط</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

           
          </div>
        </main>
      </div>

      {/* Question Edit Modal */}
      {currentQuestion && (
        <Modal 
          isOpen={isQuestionModalOpen} 
          onClose={handleCancelQuestionEdit}
          size="lg"
        >
          <QuestionForm 
            initialData={currentQuestion}
            onSubmit={handleSaveQuestion}
            onCancel={handleCancelQuestionEdit}
          />
        </Modal>
      )}
    </div>
  )
}

// Main component with Suspense boundary
export default function QuestionsPage() {
  return (
    <Suspense fallback={<Loader />}>
      <QuestionsContent />
    </Suspense>
  );
}
