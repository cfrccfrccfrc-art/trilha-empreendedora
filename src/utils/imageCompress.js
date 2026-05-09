// Compress an image File on the client using a canvas.
// Resizes so the longest side <= maxDim. Re-encodes as JPEG at given quality.
// Returns a new File. If the source is not an image or fails to load, throws.
//
// Typical input: 4–8 MB photo from a phone.
// Typical output after maxDim=1280, quality=0.78: 150–400 KB.

export async function compressImage(
  file,
  { maxDim = 1280, quality = 0.78 } = {}
) {
  if (!file || !file.type || !file.type.startsWith('image/')) {
    throw new Error('Arquivo não é uma imagem.');
  }

  const dataUrl = await readAsDataURL(file);
  const img = await loadImage(dataUrl);

  let { width, height } = img;
  if (width > maxDim || height > maxDim) {
    if (width >= height) {
      height = Math.round(height * (maxDim / width));
      width = maxDim;
    } else {
      width = Math.round(width * (maxDim / height));
      height = maxDim;
    }
  }

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  ctx.drawImage(img, 0, 0, width, height);

  const blob = await new Promise((resolve, reject) =>
    canvas.toBlob(
      (b) => (b ? resolve(b) : reject(new Error('Falha ao gerar imagem.'))),
      'image/jpeg',
      quality
    )
  );

  const baseName = (file.name || 'foto').replace(/\.[^.]+$/, '');
  return new File([blob], `${baseName}.jpg`, {
    type: 'image/jpeg',
    lastModified: Date.now(),
  });
}

function readAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = () => reject(new Error('Não foi possível ler o arquivo.'));
    reader.readAsDataURL(file);
  });
}

function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = () => reject(new Error('Imagem inválida.'));
    img.src = src;
  });
}
