-- This script is for creating a new database from scratch.
-- It defines types and creates tables in the correct order to handle foreign key dependencies.

-- Define ENUM type for attendance status
CREATE TYPE public.attendance_status AS ENUM ('attending', 'not_attending', 'tbd');

-- Create events table
CREATE TABLE public.events (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  name text NOT NULL,
  description text,
  event_date date NOT NULL,
  start_time time with time zone,
  end_time time with time zone,
  created_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT events_pkey PRIMARY KEY (id)
);

-- Create parents table
CREATE TABLE public.parents (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  name text NOT NULL,
  email text NOT NULL,
  phone text,
  volunteer boolean NOT NULL DEFAULT FALSE,
  CONSTRAINT parents_pkey PRIMARY KEY (id),
  CONSTRAINT parents_user_id_fkey FOREIGN KEY (user_id) REFERENCES auth.users(id),
  CONSTRAINT parents_email_key UNIQUE (email),
  CONSTRAINT parents_user_id_key UNIQUE (user_id)
);

-- Create children table
CREATE TABLE public.children (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  name text NOT NULL,
  grade integer,
  CONSTRAINT children_pkey PRIMARY KEY (id),
  CONSTRAINT children_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(id),
  CONSTRAINT children_name_parent_id_key UNIQUE (name, parent_id)
);

-- Create child_attendance table
CREATE TABLE public.child_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  child_id uuid NOT NULL,
  event_id uuid NOT NULL,
  status public.attendance_status NOT NULL DEFAULT 'tbd'::public.attendance_status,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT child_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT child_attendance_child_id_fkey FOREIGN KEY (child_id) REFERENCES public.children(id),
  CONSTRAINT child_attendance_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT child_attendance_child_id_event_id_key UNIQUE (child_id, event_id)
);

-- Create parent_attendance table
CREATE TABLE public.parent_attendance (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  parent_id uuid NOT NULL,
  event_id uuid NOT NULL,
  status public.attendance_status NOT NULL DEFAULT 'tbd'::public.attendance_status,
  updated_at timestamp with time zone NOT NULL DEFAULT timezone('utc'::text, now()),
  CONSTRAINT parent_attendance_pkey PRIMARY KEY (id),
  CONSTRAINT parent_attendance_parent_id_fkey FOREIGN KEY (parent_id) REFERENCES public.parents(id),
  CONSTRAINT parent_attendance_event_id_fkey FOREIGN KEY (event_id) REFERENCES public.events(id),
  CONSTRAINT parent_attendance_user_id_event_id_key UNIQUE (parent_id, event_id)
);