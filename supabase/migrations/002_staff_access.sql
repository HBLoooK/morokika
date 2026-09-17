-- Restrict dashboard data to an explicit staff allow-list.
create table if not exists public.staff_users(
  user_id uuid primary key references auth.users(id) on delete cascade,
  created_at timestamptz not null default now()
);
alter table public.staff_users enable row level security;

drop policy if exists "staff_self_read" on public.staff_users;
create policy "staff_self_read" on public.staff_users for select to authenticated using(user_id=auth.uid());

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path=''
as $$ select exists(select 1 from public.staff_users where user_id=auth.uid()) $$;
revoke all on function public.is_staff() from public;
grant execute on function public.is_staff() to authenticated;

drop policy if exists "staff_settings" on public.store_settings;
create policy "staff_settings" on public.store_settings for all to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists "staff_products" on public.products;
create policy "staff_products" on public.products for all to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists "staff_orders" on public.orders;
create policy "staff_orders" on public.orders for all to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists "staff_custom" on public.custom_requests;
create policy "staff_custom" on public.custom_requests for all to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists "staff_reviews" on public.reviews;
create policy "staff_reviews" on public.reviews for all to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists "staff_messages" on public.contact_messages;
create policy "staff_messages" on public.contact_messages for all to authenticated using(public.is_staff()) with check(public.is_staff());
drop policy if exists "staff_newsletter" on public.newsletter_subscribers;
create policy "staff_newsletter" on public.newsletter_subscribers for all to authenticated using(public.is_staff()) with check(public.is_staff());

drop policy if exists "staff_upload_product_images" on storage.objects;
create policy "staff_upload_product_images" on storage.objects for insert to authenticated with check(bucket_id='product-images' and public.is_staff());
drop policy if exists "staff_update_product_images" on storage.objects;
create policy "staff_update_product_images" on storage.objects for update to authenticated using(bucket_id='product-images' and public.is_staff()) with check(bucket_id='product-images' and public.is_staff());
drop policy if exists "staff_delete_product_images" on storage.objects;
create policy "staff_delete_product_images" on storage.objects for delete to authenticated using(bucket_id='product-images' and public.is_staff());
