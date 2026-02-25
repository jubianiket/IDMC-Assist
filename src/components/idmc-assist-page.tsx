
"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { askIdmcQuestion, type AskIdmcQuestionOutput } from "@/ai/flows/answer-idmc-question";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Loader2, ThumbsUp, ThumbsDown, Info, KeyRound, Sparkles } from "lucide-react";
import { Logo } from "@/components/icons/logo";
import { Label } from "@/components/ui/label";

const formSchema = z.object({
  question: z.string().min(10, {
    message: "Question must be at least 10 characters.",
  }),
});

type FeedbackType = "up" | "down" | null;

const modelOptions = [
  { value: 'googleai/gemini-2.0-flash', label: 'Gemini 2.0 Flash (Fastest)' },
  { value: 'googleai/gemini-1.5-pro', label: 'Gemini 1.5 Pro (Most Accurate)' },
  { value: 'googleai/gemini-1.5-flash', label: 'Gemini 1.5 Flash' },
];

export default function IdmcAssistPage() {
  const [answer, setAnswer] = useState<AskIdmcQuestionOutput | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [feedback, setFeedback] = useState<FeedbackType>(null);

  const [selectedModelId, setSelectedModelId] = useState<string>(modelOptions[0].value);
  const [apiKey, setApiKey] = useState<string>("");

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
      const result = await askIdmcQuestion({ 
        question: values.question,
        modelId: selectedModelId,
        apiKey: apiKey || undefined,
      });
      setAnswer(result);
    } catch (e) {
      setError(e instanceof Error ? e.message : "An unexpected error occurred.");
    } finally {
      setIsLoading(false);
    }
  }

  const handleFeedback = (type: "up" | "down") => {
    setFeedback(feedback === type ? null : type);
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

        <Card className="shadow-lg border-primary/10">
          <CardHeader>
            <CardTitle className="font-headline flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              Configure & Ask
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="space-y-2">
                <Label htmlFor="model-select">Select AI Model</Label>
                <Select value={selectedModelId} onValueChange={setSelectedModelId}>
                  <SelectTrigger id="model-select">
                    <SelectValue placeholder="Select a model" />
                  </SelectTrigger>
                  <SelectContent>
                    {modelOptions.map(option => (
                      <SelectItem key={option.value} value={option.value}>
                        {option.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="api-key">Gemini API Key (Optional)</Label>
                <div className="relative">
                  <KeyRound className="absolute left-2.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                  <Input
                    id="api-key"
                    type="password"
                    placeholder="Enter Google AI API key"
                    value={apiKey}
                    onChange={(e) => setApiKey(e.target.value)}
                    className="pl-8"
                  />
                </div>
              </div>
            </div>

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
                          className="min-h-[120px] resize-none focus-visible:ring-primary"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg transition-all hover:scale-[1.01]">
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                      Consulting AI...
                    </>
                  ) : (
                    "Ask AI Assistant"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>

        {error && (
          <Alert variant="destructive" className="shadow-md animate-in fade-in slide-in-from-top-4">
            <AlertTitle>Error</AlertTitle>
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        {answer && (
          <Card className="shadow-lg border-accent/20 animate-in fade-in slide-in-from-bottom-4">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-center">
                <CardTitle className="font-headline text-lg">AI Response</CardTitle>
                <div className="text-xs bg-muted px-2 py-1 rounded-full text-muted-foreground">
                  Model: {selectedModelId}
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <p className="whitespace-pre-wrap text-foreground font-body leading-relaxed">{answer.answer}</p>
            </CardContent>
            <CardFooter className="flex justify-end space-x-2 pt-2">
              <span className="text-xs text-muted-foreground self-center mr-2 italic">Was this helpful?</span>
              <Button
                variant={feedback === "up" ? "default" : "outline"}
                size="icon"
                onClick={() => handleFeedback("up")}
                className={feedback === "up" ? "bg-accent text-accent-foreground" : "h-8 w-8"}
                aria-label="Helpful"
              >
                <ThumbsUp className="h-4 w-4" />
              </Button>
              <Button
                variant={feedback === "down" ? "default" : "outline"}
                size="icon"
                onClick={() => handleFeedback("down")}
                className={feedback === "down" ? "bg-destructive text-destructive-foreground" : "h-8 w-8"}
                aria-label="Not helpful"
              >
                <ThumbsDown className="h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        )}

        <Alert className="shadow-md bg-muted/30 border-none">
          <Info className="h-4 w-4 text-primary" />
          <AlertTitle className="font-headline text-sm">AI Learning Assistant Notice</AlertTitle>
          <AlertDescription className="text-xs">
            OpenAI models are temporarily disabled due to registry issues in your environment. Please use the available Gemini models. 
            Information provided may not always be accurate. Verify with official Informatica documentation.
          </AlertDescription>
        </Alert>
      </main>
    </div>
  );
}
