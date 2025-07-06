import React from "react";
import styled from "styled-components";
import { useForm } from "react-hook-form";
import emailjs from "emailjs-com";
import toast, { Toaster } from "react-hot-toast";
import {FaEnvelope } from "react-icons/fa";

// Styled Components
const Container = styled.div`
  padding: 2rem;
  @media (max-width: 600px) {
    padding: 1.5rem;
  }
`;

const Title = styled.h2`
  text-align: center;
  font-size: 2rem;
  margin-bottom: 2rem;
  color: ${({ theme }) => theme.textPrimary || "#fff"};
`;

const Form = styled.form`
  max-width: 400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const FieldWrapper = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 0.95rem;
  margin-bottom: 0.4rem;
  color: ${({ theme }) => theme.textSecondary || "#333"};
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const Input = styled.input`
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  outline: none;
  background-color: ${({ theme }) => theme.textAreaBg || "#1f1f1f"};
  &:focus {
    border-color: ${({ theme }) => theme.accent || "#82c91e"};
    color: ${({ theme }) => theme.textPrimary || "#fff"};
  }
`;

const TextArea = styled.textarea`
  padding: 0.75rem 1rem;
  border: 1px solid #ccc;
  border-radius: 5px;
  font-size: 1rem;
  resize: vertical;
  min-height: 120px;
  outline: none;
  background-color: ${({ theme }) => theme.textAreaBg || "#1f1f1f"};
  &:focus {
    border-color: ${({ theme }) => theme.accent || "#82c91e"};
    color: ${({ theme }) => theme.textPrimary || "#fff"};
  }
`;

const Button = styled.button`
  background-color: ${({ theme }) => theme.accent || "#82c91e"};
  color: white;
  font-weight: 500;
  padding: 0.75rem 1rem;
  border: none;
  border-radius: 50px;
  cursor: pointer;
  margin: 2rem 0 1rem;
  transition: background 0.3s ease;
  &:hover {
    background-color: ${({ theme }) => theme.scrollButtonHoverBg || "red"};
  }
`;

const UserIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M12 12c2.7 0 5-2.3 5-5s-2.3-5-5-5-5 2.3-5 5 2.3 5 5 5zm0 2c-3.3 0-10 1.7-10 5v3h20v-3c0-3.3-6.7-5-10-5z" />
  </svg>
);

const MailIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M20 4H4a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V6a2 2 0 0 0-2-2zm0 2v.01L12 13 4 6.01V6h16z" />
  </svg>
);

const MessageIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" fill="currentColor" viewBox="0 0 24 24">
    <path d="M4 4h16v12H5.17L4 17.17V4zm0-2a2 2 0 0 0-2 2v18l4-4h14a2 2 0 0 0 2-2V4a2 2 0 0 0-2-2H4z" />
  </svg>
);

const SendIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="12" height="12" fill="currentColor" viewBox="0 0 24 24">
    <path d="M2.01 21L23 12 2.01 3 2 10l15 2-15 2z" />
  </svg>
);

export default function ContactForm() {
  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm();

  const onSubmit = async (data) => {
    try {
      await emailjs.send(
        "service_62w3kk8",
        "template_l153uir",
        data,
        "FAiB8BnVKPLUEye4d"
      );
      toast.success("Message sent successfully!");
      reset();
    } catch (error) {
      console.error("FAILED...", error);
      toast.error("Something went wrong. Please try again later.");
    }
  };

  return (
    <Container>

        <title>Let's Connect</title>
        <meta name="description" content="Dara Phillips is an aspiring Product & XR Designer specialising in immersive, interactive experiences using creative technology." />
        <meta name="keywords" content="React, Digital Media, Portfolio, Dara Phillips" />
        <meta property="og:title" content="Dara Phillips Portfolio" />
        <meta property="og:description" content="Recent Graduate | Product & XR Designer" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://portfolio-2025-a4c0b.firebaseapp.com/" />
        <meta property="og:image" content="https://yourdomain.com/preview.jpg" />

      <Toaster position="top-center" />
      <Title>Let's Connect</Title>
      <Form onSubmit={handleSubmit(onSubmit)} noValidate>
        <FieldWrapper>
          <Label htmlFor="name"><UserIcon /> Name</Label>
          <Input
            id="name"
            type="text"
            {...register("name", { required: "Name is required" })}
            placeholder="Your name"
            aria-invalid={errors.name ? "true" : "false"}
          />
          {errors.name && <small style={{ color: "red" }}>{errors.name.message}</small>}
        </FieldWrapper>

        <FieldWrapper>
          <Label htmlFor="email"><FaEnvelope /> Email</Label>
          <Input
            id="email"
            type="email"
            {...register("email", {
              required: "Email is required",
              pattern: {
                value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
                message: "Invalid email address",
              },
            })}
            placeholder="Your email"
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && <small style={{ color: "red" }}>{errors.email.message}</small>}
        </FieldWrapper>

        <FieldWrapper>
          <Label htmlFor="message"><MessageIcon /> Message</Label>
          <TextArea
            id="message"
            {...register("message", { required: "Message is required" })}
            placeholder="Your message"
            aria-invalid={errors.message ? "true" : "false"}
          />
          {errors.message && <small style={{ color: "red" }}>{errors.message.message}</small>}
        </FieldWrapper>

        <Button type="submit" disabled={isSubmitting}>
          {isSubmitting ? "Sending..." : "Send Message"} <SendIcon />
        </Button>
      </Form>
    </Container>
  );
}
