import QuizDetail from '@/components/quiz/QuizDetail';

export default async function QuizPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;
  return <QuizDetail quizId={params.id} />;
}
