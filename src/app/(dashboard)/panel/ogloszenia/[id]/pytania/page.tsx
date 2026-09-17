"use client";

import { useState, use, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";
import { MessageSquare, Send, Loader2 } from "lucide-react";

type Question = {
  id: string;
  content: string;
  createdAt: string;
  answer?: string;
  answeredAt?: string;
};

export default function QuestionsPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const resolvedParams = use(params);
  const { id } = resolvedParams;

  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [answerContent, setAnswerContent] = useState<{ [key: string]: string }>({});
  const [submitting, setSubmitting] = useState<{ [key: string]: boolean }>({});

  useEffect(() => {
    const fetchQuestions = async () => {
      try {
        const res = await fetch(`/api/announcements/${id}/questions`);
        if (!res.ok) throw new Error("Nie udało się pobrać pytań");
        const data = await res.json();
        setQuestions(data);
      } catch (err: any) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [id]);

  const handleAnswerSubmit = async (questionId: string) => {
    const answer = answerContent[questionId];
    if (!answer || answer.trim() === "") return;

    setSubmitting(prev => ({ ...prev, [questionId]: true }));
    try {
      const res = await fetch(`/api/announcements/${id}/questions/${questionId}/answers`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: answer })
      });

      if (!res.ok) throw new Error("Nie udało się opublikować odpowiedzi");
      const updatedQuestion = await res.json();

      setQuestions(questions.map(q =>
        q.id === questionId ? updatedQuestion : q
      ));

      setAnswerContent(prev => ({ ...prev, [questionId]: "" }));
    } catch (err: any) {
      console.error(err);
      alert(err.message);
    } finally {
      setSubmitting(prev => ({ ...prev, [questionId]: false }));
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="w-8 h-8 animate-spin text-navy-800" /></div>;
  if (error) return <div className="text-red-500 p-4">{error}</div>;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-navy-900">Pytania i odpowiedzi</h1>
        <p className="text-gray-500 mt-1">Zarządzaj pytaniami zadanymi do ogłoszenia.</p>
      </div>

      <div className="space-y-4">
        {questions.length === 0 ? (
          <Card>
            <CardContent className="py-12 text-center text-gray-500">
              <MessageSquare className="h-12 w-12 mx-auto text-gray-300 mb-4" />
              <p>Do tego ogłoszenia nie zadano jeszcze żadnych pytań.</p>
            </CardContent>
          </Card>
        ) : (
          questions.map((q) => (
            <Card key={q.id} className={!q.answer ? "border-l-4 border-l-amber-500" : ""}>
              <CardHeader className="pb-3">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <Badge variant={q.answer ? "secondary" : "default"} className={!q.answer ? "bg-amber-100 text-amber-800 hover:bg-amber-100" : "bg-[#B8DB8F] text-[#145447] hover:bg-[#a6cc7d]"}>
                      {q.answer ? "Odpowiedziano" : "Wymaga odpowiedzi"}
                    </Badge>
                    <div className="text-sm text-gray-500 mt-2">Data zapytania: {formatDate(new Date(q.createdAt))}</div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-gray-50 p-4 rounded-md text-gray-800">
                  <span className="font-semibold block mb-1">Pytanie:</span>
                  {q.content}
                </div>

                {q.answer ? (
                  <div className="bg-[#F1F5F2] p-4 rounded-md text-[#145447] border border-[#B8DB8F]">
                    <span className="font-semibold block mb-1">Twoja odpowiedź ({q.answeredAt ? formatDate(new Date(q.answeredAt)) : "-"}):</span>
                    {q.answer}
                  </div>
                ) : (
                  <div className="space-y-2 mt-4 pt-4 border-t">
                    <label className="text-sm font-medium text-gray-700">Udziel odpowiedzi (będzie widoczna publicznie)</label>
                    <Textarea
                      rows={3}
                      placeholder="Wpisz treść odpowiedzi..."
                      value={answerContent[q.id] || ""}
                      onChange={(e) => setAnswerContent(prev => ({ ...prev, [q.id]: e.target.value }))}
                    />
                    <div className="flex justify-end">
                      <Button
                        onClick={() => handleAnswerSubmit(q.id)}
                        disabled={!answerContent[q.id]?.trim() || submitting[q.id]}
                        className="bg-[#145447] hover:bg-[#0D4036] text-white"
                      >
                        {submitting[q.id] ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />} Opublikuj odpowiedź
                      </Button>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
