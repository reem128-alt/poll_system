const url=process.env.NEXT_PUBLIC_API_URL
import { Question } from "./poll";
import { Answer } from "./poll";

export const updateQuestion = async (id: number, questionData: Partial<Question>): Promise<Question> => {
  try {
    // Create a deep copy of the question data to avoid modifying the original
    const cleanedQuestionData = JSON.parse(JSON.stringify(questionData));
    
    // Handle answers IDs for new answers
    if (cleanedQuestionData.answers) {
      cleanedQuestionData.answers = cleanedQuestionData.answers.map((answer: any) => {
        // If this is a new answer (id is a temporary client-side ID like 0, 1, 2)
        if (typeof answer.id === 'number' && answer.id < 1000) {
          // eslint-disable-next-line @typescript-eslint/no-unused-vars
          const { id, ...answerWithoutId } = answer;
          return answerWithoutId;
        }
        return answer;
      });
    }
    
    const response = await fetch(`${url}/question/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(cleanedQuestionData)
    });
    
    if (!response.ok) {
      throw new Error('فشل في تحديث السؤال');
    }
    
    const data = await response.json();
    return data;
  } catch (error) {
    console.error('Error updating question:', error);
    throw new Error('حدث خطأ في الاتصال بالخادم');
  }
};

