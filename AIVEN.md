# Aiven bağlantısı

1. Aiven'de bir PostgreSQL servisi oluştur.
2. **Overview > Connection information > Service URI** değerini kopyala.
3. Vercel projesinin **Settings > Environment Variables** bölümüne `DATABASE_URL` adıyla ekle.
4. Production, Preview ve Development ortamlarını seçip projeyi yeniden yayınla.

Tablo ilk istekte otomatik oluşturulur. Senkronizasyon kodunun kendisi yerine SHA-256 özeti saklanır.
