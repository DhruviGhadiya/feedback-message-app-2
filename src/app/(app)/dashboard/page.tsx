"use client";
import MessageCard from '@/components/MessageCard';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Message } from '@/model/User';
import { acceptMessageSchema } from '@/schemas/acceptMessageSchema';
import { ApiResponse } from '@/types/ApiResponse';
import { zodResolver } from '@hookform/resolvers/zod';
import axios, { AxiosError } from 'axios';
import { Loader2, RefreshCcw } from 'lucide-react';
import { User } from 'next-auth';
import { useSession } from 'next-auth/react';
import React, { useCallback, useEffect, useState } from 'react'
import { useForm } from 'react-hook-form';
import { toast } from 'sonner';

const Page = () => {
    const [messages, setMessages] = useState<Message[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isSwitchLoading, setIsSwitchLoading] = useState(false);
    const [profileUrl, setProfileUrl] = useState("");

    const handleDeleteMessage = (messagesId: string) => {
        setMessages(messages.filter((message) => message._id !== messagesId));
    }

    const { data: session } = useSession();

    const form = useForm({
        resolver: zodResolver(acceptMessageSchema)
    });

    const { register, watch, setValue } = form;

    const acceptMessages = watch('acceptMessage');

    const fetchAcceptMessage = useCallback(async () => {
        setIsSwitchLoading(true);
        try {
            const response = await axios.get('/api/accept-messages');
            setValue('acceptMessage', response.data.isAcceptingMessage);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast("Error", {
                description: axiosError.response?.data.message || "Failed to fetch message settings"
            })
        }
        finally {
            setIsSwitchLoading(false);
        }
    }, [setValue])


    const fetchMessages = useCallback(async (refresh: boolean = false) => {
        setIsLoading(true);
        setIsSwitchLoading(true);
        try {
            const response = await axios.get('/api/get-messages');
            setMessages(response.data.messages);
            if (refresh) {
                toast('Refreshed Messages', {
                    description: 'Showing latest messages',
                });
            }
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast('Error', {
                description: axiosError.response?.data.message || 'Failed to fetch messages'
            });
        }
        finally {
            setIsLoading(false);
            setIsSwitchLoading(false);
        }
    }, [setMessages, setIsLoading, toast])

    useEffect(() => {
        if (!session || !session.user) return

        fetchMessages();
        fetchAcceptMessage();
    }, [session, setValue, fetchAcceptMessage, fetchMessages])

    const handleSwitchChange = async () => {
        try {
            const res = await axios.post<ApiResponse>('/api/accept-messages', {
                acceptMessages: !acceptMessages
            })
            setValue("acceptMessage", !acceptMessages);
            toast(res.data.message);
        } catch (error) {
            const axiosError = error as AxiosError<ApiResponse>;
            toast('Error', {
                description: axiosError.response?.data.message || 'Failed to fetch messages'
            });
        }
    }

    useEffect(() => {
        if (typeof window !== 'undefined' && session?.user) {
            const { protocol, host } = window.location;
            const username = (session.user as User)?.username;
            setProfileUrl(`${protocol}//${host}/u/${username}`);
        }
    }, [session]);

        
    const copyToClipboard = () => {
        navigator.clipboard.writeText(profileUrl)
        toast("URL Copied", {
            description: "URL has been copied to clipboard"
        })
    }

    // if (!session || !session.user) {
    //     return <div>Please Login</div>
    // }

    return (
        <div className="my-8 mx-4 md:mx-8 lg:mx-auto p-6 bg-white rounded w-full max-w-6xl">
            <h1 className="text-4xl font-bold mb-4">User Dashboard</h1>

            <div className="mb-4">
                <h2 className="text-lg font-semibold mb-2">Copy Your Unique Link</h2>{' '}
                <div className="flex items-center">
                    <input
                        type="text"
                        value={profileUrl}
                        disabled
                        className="input input-bordered bg-gray-100 rounded w-full p-2 mr-2"
                    />
                    <Button onClick={copyToClipboard}>Copy</Button>
                </div>
            </div>

            <div className="mb-4">
                <Switch
                    {...register('acceptMessage')}
                    checked={acceptMessages}
                    onCheckedChange={handleSwitchChange}
                    disabled={isSwitchLoading}
                />
                <span className="ml-2">
                    Accept Messages: {acceptMessages ? 'On' : 'Off'}
                </span>
            </div>
            <Separator />

            <Button
                className="mt-4"
                variant="outline"
                onClick={(e) => {
                    e.preventDefault();
                    fetchMessages(true);
                }}
            >
                {isLoading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <RefreshCcw className="h-4 w-4" />
                )}
            </Button>
            <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-6">
                {messages.length > 0 ? (
                    messages.map((message, index) => (
                        <MessageCard
                            key={index}
                            message={message}
                            onMessageDelete={handleDeleteMessage}
                        />
                    ))
                ) : (
                    <p>No messages to display.</p>
                )}
            </div>
        </div>
    );
}

export default Page
