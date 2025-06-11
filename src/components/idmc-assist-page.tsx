"use client";

import { useState, type FormEvent } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { askIdmcQuestion, type AskIdmcQuestionOutput } from "@/ai/flows/answer-idmc-question";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ThumbsUp, ThumbsDown, Info } from "lucide-react";
import { Logo } from "@/components/icons/logo";

const formSchema = z.object({
  question: z.string().min(10, {
    message: "Question must be at least 10 characters.",
  }),
});

type FeedbackType = "up" | "down" | null;

export default function IdmcAssistPage() {
  const [answer, setAnswer] = useState<AskIdmcQuestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackType>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      question: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsLoading(true);
    setError(null);
    setAnswer(null);
    setFeedback(null);

    try {
      const result = await askIdmcQuestion({ question: values.question });
      setAnswer(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleFeedback = (type: "up" | "down") => {
    if (feedback === type) {
      setFeedback(null);
    } else {
      setFeedback(type);
    }
    // In a real app, you would send this feedback to a server
    console.log(`Feedback received: ${type}`);
  };

  return (
    <div className="flex min-h-screen flex-col items-center justify-center p-4 sm:p-6 md:p-8 bg-background">
      <main className="w-full max-w-2xl space-y-8">
        <header className="flex flex-col items-center space-y-2">
          <Logo />
          <h1 className="text-3xl font-bold font-headline text-foreground">IDMC Assist</h1>
          <p className="text-muted-foreground text-center">
            Ask questions about Informatica IDMC and get AI-powered answers.
          </p>
        </header>

        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="font-headline">Ask a Question</CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="question"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Your Question</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="e.g., How do I configure a mapping in IDMC?"
                          className="min-h-[100px] resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full bg-primary hover:bg-primary/90">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Getting Answer...
                    </>
                  ) : (
                    "Ask AI"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="shadow-md">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {answer && (
          <Card className="shadow-lg">
            <CardHeader>
              <CardTitle className="font-headline">AI Response</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground">{answer.answer}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2">
              <Button
                variant={feedback === "up" ? "default" : "outline"}
                size="icon"
                onClick={() => handleFeedback("up")}
                className={feedback === "up" ? "bg-accent text-accent-foreground hover:bg-accent/90" : ""}
                aria-label="Helpful"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant={feedback === "down" ? "default" : "outline"}
                size="icon"
                onClick={() => handleFeedback("down")}
                className={feedback === "down" ? "bg-destructive text-destructive-foreground hover:bg-destructive/90" : ""}
                aria-label="Not helpful"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        <Alert className="shadow-md">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="font-headline">Disclaimer</AlertTitle>
          <AlertDescription>
            This AI is a learning assistant. Information provided may not always be accurate or complete.
            Always verify critical information with official Informatica IDMC documentation.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
}
