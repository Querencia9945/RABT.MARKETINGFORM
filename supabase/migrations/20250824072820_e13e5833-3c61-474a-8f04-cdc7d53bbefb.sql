-- Create onboarding_submissions table
CREATE TABLE public.onboarding_submissions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  company TEXT NOT NULL,
  website TEXT,
  contact_name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT,
  goals TEXT NOT NULL,
  selected_services TEXT[] NOT NULL,
  budget TEXT NOT NULL,
  timeline TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.onboarding_submissions ENABLE ROW LEVEL SECURITY;

-- Create policy to allow anyone to insert (public form)
CREATE POLICY "Anyone can submit onboarding forms" 
ON public.onboarding_submissions 
FOR INSERT 
WITH CHECK (true);

-- Create policy to allow only authenticated users to view submissions
CREATE POLICY "Authenticated users can view submissions" 
ON public.onboarding_submissions 
FOR SELECT 
USING (auth.role() = 'authenticated');

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_onboarding_submissions_updated_at
BEFORE UPDATE ON public.onboarding_submissions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();