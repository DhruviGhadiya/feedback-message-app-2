"use client";
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
import { Input } from '@/components/ui/input';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { messageSchema } from '@/schemas/messageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2 } from 'lucide-react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import React, { useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';
import * as z from "zod";

const Page = () => {
  const initialMessageString =
    "What's your favorite movie?-Do you have any pets?-What's your dream job?";

  const { username } = useParams();
  const [messages, setMessages] = useState<string[] | { error: string }>(initialMessageString.split('-'));
  const [loading, setLoading] = useState(false);


  const suggestMessages = async () => {
    setLoading(true);
    const requests = Array.from({ length: 3 }).map(() =>
      fetch("https://api-inference.huggingface.co/models/google/flan-t5-small", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${process.env.HUGGINGFACE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          inputs: "Create a list of three open-ended and engaging questions formatted as a single string. Each question should be separated by '||'. These questions are for an anonymous social messaging platform, like Qooh.me, and should be suitable for a diverse audience. Avoid personal or sensitive topics, focusing instead on universal themes that encourage friendly interaction. For example, your output should be structured like this: 'What’s a hobby you’ve recently started?|| If you could have dinner with any historical figure, who would it be?|| What’s a simple thing that makes you happy?'. Ensure the questions are intriguing, foster curiosity, and contribute to a positive and welcoming conversational environment.",
          parameters: {
            temperature: Math.random() * 0.5 + 0.7, // Vary temperature for randomness
            top_p: 0.9,
            do_sample: true,
            max_new_tokens: 100,
          }
        }),
      }).then(res => res.json())
    );

    const results = await Promise.all(requests);


    const generatedMessages = results.map((result) => {
      const rawMessage =
        result?.[0]?.generated_text || result?.generated_text || result?.error || "Error generating";

      // Remove any leading dash, bullet, or space
      return rawMessage.replace(/^[-–•\s]+/, '').trim();
    });

    console.log(results);

    setMessages(generatedMessages);
    setLoading(false);
  }

  const handleMessageClick = (message: string) => {
    form.setValue('content', message);
  };

  const sendMessages = async (data: z.infer<typeof messageSchema>) => {
    setLoading(true);
    try {
      const res = await axios.post('/api/send-message', {
        username,
        ...data,
      })
      toast(res.data.message);
      form.reset({ ...form.getValues(), content: '' });
    } catch (error) {
      const axiosError = error as AxiosError<ApiResponse>;
      toast('Error', {
        description:
          axiosError.response?.data.message ?? 'Failed to sent message'
      });
    }
    finally {
      setLoading(false);
    }
  }

  const form = useForm({
    resolver: zodResolver(messageSchema)
  })

  const messageContent = form.watch('content');

  return (
    <>
      <div className="container mx-auto my-8 p-6 bg-white rounded max-w-4xl">
        <h1 className="text-4xl font-bold mb-6 text-center">
          Public Profile Link
        </h1>


        {/* Form */}
        <Form {...form}>
          <form onSubmit={form.handleSubmit(sendMessages)} className='space-y-6'>
            <FormField
              name="content"
              control={form.control}
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Send Anonymous Message to @{username}</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Write your anonymous message here"
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <div className="flex justify-center">
              {loading ? (
                <Button disabled>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Please wait
                </Button>
              ) : (
                <Button type="submit" disabled={loading || !messageContent}>
                  Send It
                </Button>
              )}
            </div>
          </form>
        </Form>


        <div className="space-y-4 my-8">
          <div className="space-y-2">
            <Button
              onClick={suggestMessages}
              className="my-4"
              disabled={loading}
            >
              {loading ? "Loading..." : "Suggest Messages"}
            </Button>
            <p>Click on any message below to select it.</p>
          </div>
          <Card>
            <CardHeader>
              <h3 className="text-xl font-semibold">Messages</h3>
            </CardHeader>
            <CardContent className="flex flex-col space-y-4">
              {Array.isArray(messages) ? (
                messages.map((message, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    className="mb-2"
                    onClick={() => handleMessageClick(message)}
                  >
                    {message}
                  </Button>
                ))
              ) : 'error' in messages ? (
                <p className="text-red-500">{messages.error}</p>
              ) : null}
            </CardContent>
          </Card>
        </div>
        <Separator className="my-6" />
      </div>
      <div className="text-center">
        <div className="mb-4">Get Your Message Board</div>
        <Link href={'/sign-up'}>
          <Button>Create Your Account</Button>
        </Link>
      </div>
    </>
  )
}

export default Page
