-- Storage bucket for client documents (private)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'client-documents',
  'client-documents',
  false,
  52428800,
  ARRAY['application/pdf', 'audio/mpeg', 'audio/mp4', 'audio/wav', 'image/png', 'image/jpeg', 'text/plain']
)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY client_documents_storage_admin ON storage.objects
  FOR ALL USING (bucket_id = 'client-documents' AND is_admin())
  WITH CHECK (bucket_id = 'client-documents' AND is_admin());

CREATE POLICY client_documents_storage_client_read ON storage.objects
  FOR SELECT USING (
    bucket_id = 'client-documents'
    AND EXISTS (
      SELECT 1 FROM client_documents cd
      JOIN client_profiles cp ON cp.id = cd.client_profile_id
      WHERE cd.storage_path = name AND cp.user_id = auth.uid()
    )
  );
