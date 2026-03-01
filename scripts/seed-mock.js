'use strict';

/**
 * Seed script para criar 4 categorias + 80 produtos mockados.
 * Usa a Documents API do Strapi v5.
 * Reutiliza as fotos de produto já existentes no banco (file_ids 25-32).
 *
 * Rodar com: npm run seed:mock
 */

// IDs das fotos de produto já cadastradas no banco
const PRODUCT_IMAGE_IDS = [25, 26, 27, 28, 29, 30, 31, 32];

// Pares de imagens para simular cover + gallery variada
const IMAGE_PAIRS = [
  { cover: 25, gallery: [25, 26] }, // camisa00-00, camisa00-01
  { cover: 26, gallery: [26, 25] }, // camisa00-01, camisa00-00
  { cover: 28, gallery: [28, 29] }, // camisa01-00, camisa01-01
  { cover: 29, gallery: [29, 28] }, // camisa01-01, camisa01-00
  { cover: 30, gallery: [30, 27] }, // rashguard00-00, rashguard00-01
  { cover: 27, gallery: [27, 30] }, // rashguard00-01, rashguard00-00
  { cover: 31, gallery: [31, 32] }, // rashguard01-00, rashguard01-01
  { cover: 32, gallery: [32, 31] }, // rashguard01-01, rashguard01-00
];

// Novas categorias a criar
const NEW_CATEGORIES = [
  { slug: 'kimono', name: 'Kimono' },
  { slug: 'acessorios', name: 'Acessórios' },
  { slug: 'equipamentos', name: 'Equipamentos' },
  { slug: 'colecao-infantil', name: 'Coleção Infantil' },
];

// Produtos por categoria — 20 cada
const MOCK_PRODUCTS = {
  kimono: [
    { title: 'Kimono Competição Branco A1', price: 349.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'] },
    { title: 'Kimono Competição Azul A1', price: 349.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'] },
    { title: 'Kimono Competição Preto A1', price: 369.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4'] },
    { title: 'Kimono Treino Branco Reforçado', price: 279.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'] },
    { title: 'Kimono Treino Azul Reforçado', price: 279.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'] },
    { title: 'Kimono Ultra Leve Branco', price: 319.9, sizes: ['A1', 'A2', 'A3', 'A4'] },
    { title: 'Kimono Ultra Leve Azul', price: 319.9, sizes: ['A1', 'A2', 'A3', 'A4'] },
    { title: 'Kimono Edição Limitada Unicamp', price: 449.9, sizes: ['A0', 'A1', 'A2', 'A3'] },
    { title: 'Kimono Feminino Branco', price: 299.9, sizes: ['F1', 'F2', 'F3', 'F4'] },
    { title: 'Kimono Feminino Azul', price: 299.9, sizes: ['F1', 'F2', 'F3', 'F4'] },
    { title: 'Kimono Trançado Pesado Branco', price: 399.9, sizes: ['A1', 'A2', 'A3', 'A4', 'A5'] },
    { title: 'Kimono Trançado Pesado Azul', price: 399.9, sizes: ['A1', 'A2', 'A3', 'A4', 'A5'] },
    { title: 'Kimono Viagem Compacto', price: 259.9, sizes: ['A1', 'A2', 'A3'] },
    { title: 'Calça de Kimono Avulsa Branca', price: 129.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'] },
    { title: 'Calça de Kimono Avulsa Azul', price: 129.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4', 'A5'] },
    { title: 'Kimono Iniciante Branco', price: 199.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4'] },
    { title: 'Kimono Iniciante Azul', price: 199.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4'] },
    { title: 'Kimono Pro Series Preto', price: 499.9, sizes: ['A1', 'A2', 'A3'] },
    { title: 'Kimono Ripstop Cinza', price: 339.9, sizes: ['A0', 'A1', 'A2', 'A3', 'A4'] },
    { title: 'Kimono Dupla Face Branco/Azul', price: 429.9, sizes: ['A1', 'A2', 'A3', 'A4'] },
  ],
  acessorios: [
    { title: 'Faixa Branca Oficial', price: 39.9, sizes: ['M3', 'M4', 'M5'] },
    { title: 'Faixa Azul Oficial', price: 49.9, sizes: ['M3', 'M4', 'M5'] },
    { title: 'Faixa Roxa Oficial', price: 49.9, sizes: ['M3', 'M4', 'M5'] },
    { title: 'Faixa Marrom Oficial', price: 49.9, sizes: ['M3', 'M4', 'M5'] },
    { title: 'Faixa Preta Oficial', price: 59.9, sizes: ['M3', 'M4', 'M5'] },
    { title: 'Bolsa Esportiva BJJ Unicamp', price: 119.9, sizes: ['U'] },
    { title: 'Mochila Treino BJJ Unicamp', price: 149.9, sizes: ['U'] },
    { title: 'Sacola para Kimono', price: 49.9, sizes: ['U'] },
    { title: 'Protetor Bucal Simples', price: 29.9, sizes: ['P', 'M', 'G'] },
    { title: 'Protetor Bucal Duplo Pro', price: 69.9, sizes: ['P', 'M', 'G'] },
    { title: 'Joelheira Neoprene Par', price: 89.9, sizes: ['P', 'M', 'G', 'GG'] },
    { title: 'Cotoveleira Neoprene Par', price: 79.9, sizes: ['P', 'M', 'G', 'GG'] },
    { title: 'Chinelo BJJ Unicamp', price: 59.9, sizes: ['36', '38', '40', '42', '44'] },
    { title: 'Toalha de Treino Microfibra', price: 44.9, sizes: ['U'] },
    { title: 'Garrafa Squeeze 1L BJJ', price: 39.9, sizes: ['U'] },
    { title: 'Adesivo Kit BJJ Unicamp (5un)', price: 15.9, sizes: ['U'] },
    { title: 'Patch Bordado BJJ Unicamp', price: 24.9, sizes: ['U'] },
    { title: 'Boné Trucker BJJ Unicamp', price: 59.9, sizes: ['U'] },
    { title: 'Bandagem Elástica 3m Par', price: 34.9, sizes: ['U'] },
    { title: 'Chaveiro BJJ Unicamp', price: 19.9, sizes: ['U'] },
  ],
  equipamentos: [
    { title: 'Tatame EVA 1m x 1m (4 peças)', price: 189.9, sizes: ['20mm', '30mm', '40mm'] },
    { title: 'Dummy de Treino 1,60m', price: 599.9, sizes: ['U'] },
    { title: 'Dummy de Treino 1,80m', price: 699.9, sizes: ['U'] },
    { title: 'Corda de Pular Speed Rope', price: 59.9, sizes: ['U'] },
    { title: 'Elástico de Resistência Leve', price: 29.9, sizes: ['U'] },
    { title: 'Elástico de Resistência Médio', price: 34.9, sizes: ['U'] },
    { title: 'Elástico de Resistência Forte', price: 39.9, sizes: ['U'] },
    { title: 'Kit Elásticos de Resistência (3un)', price: 89.9, sizes: ['U'] },
    { title: 'Rolo de Espuma Massagem', price: 79.9, sizes: ['U'] },
    { title: 'Bola de Lacrosse Liberação', price: 24.9, sizes: ['U'] },
    { title: 'Grip Trainer Mão', price: 44.9, sizes: ['Leve', 'Médio', 'Forte'] },
    { title: 'Caneleira de Peso 2kg Par', price: 69.9, sizes: ['U'] },
    { title: 'Caneleira de Peso 3kg Par', price: 84.9, sizes: ['U'] },
    { title: 'Kettlebell Emborrachado 8kg', price: 129.9, sizes: ['U'] },
    { title: 'Kettlebell Emborrachado 12kg', price: 169.9, sizes: ['U'] },
    { title: 'Kettlebell Emborrachado 16kg', price: 219.9, sizes: ['U'] },
    { title: 'Aparador de Chute Curvo', price: 149.9, sizes: ['U'] },
    { title: 'Luva de Treino MMA', price: 119.9, sizes: ['P', 'M', 'G', 'GG'] },
    { title: 'Cronômetro Digital de Parede', price: 189.9, sizes: ['U'] },
    { title: 'Timer Tabata Portátil', price: 99.9, sizes: ['U'] },
  ],
  'colecao-infantil': [
    { title: 'Kimono Infantil Branco', price: 179.9, sizes: ['M0', 'M1', 'M2', 'M3', 'M4'] },
    { title: 'Kimono Infantil Azul', price: 179.9, sizes: ['M0', 'M1', 'M2', 'M3', 'M4'] },
    { title: 'Kimono Infantil Rosa', price: 189.9, sizes: ['M0', 'M1', 'M2', 'M3', 'M4'] },
    { title: 'Rashguard Infantil Manga Longa', price: 69.9, sizes: ['2', '4', '6', '8', '10', '12'] },
    { title: 'Rashguard Infantil Manga Curta', price: 59.9, sizes: ['2', '4', '6', '8', '10', '12'] },
    { title: 'Camiseta Infantil Preta BJJ', price: 39.9, sizes: ['2', '4', '6', '8', '10', '12'] },
    { title: 'Camiseta Infantil Branca BJJ', price: 39.9, sizes: ['2', '4', '6', '8', '10', '12'] },
    { title: 'Shorts Infantil de Treino', price: 49.9, sizes: ['2', '4', '6', '8', '10', '12'] },
    { title: 'Faixa Infantil Branca', price: 29.9, sizes: ['M0', 'M1', 'M2', 'M3'] },
    { title: 'Faixa Infantil Cinza', price: 29.9, sizes: ['M0', 'M1', 'M2', 'M3'] },
    { title: 'Faixa Infantil Amarela', price: 29.9, sizes: ['M0', 'M1', 'M2', 'M3'] },
    { title: 'Faixa Infantil Laranja', price: 29.9, sizes: ['M0', 'M1', 'M2', 'M3'] },
    { title: 'Faixa Infantil Verde', price: 29.9, sizes: ['M0', 'M1', 'M2', 'M3'] },
    { title: 'Protetor Bucal Infantil', price: 24.9, sizes: ['P', 'M'] },
    { title: 'Mochila Infantil BJJ Unicamp', price: 89.9, sizes: ['U'] },
    { title: 'Garrafa Squeeze Infantil 500ml', price: 29.9, sizes: ['U'] },
    { title: 'Joelheira Infantil Par', price: 59.9, sizes: ['PP', 'P', 'M'] },
    { title: 'Kimono Infantil Competição Branco', price: 229.9, sizes: ['M0', 'M1', 'M2', 'M3', 'M4'] },
    { title: 'Kimono Infantil Competição Azul', price: 229.9, sizes: ['M0', 'M1', 'M2', 'M3', 'M4'] },
    { title: 'Kit Iniciante Infantil Completo', price: 269.9, sizes: ['M0', 'M1', 'M2', 'M3'] },
  ],
};

// Descrições genéricas por categoria (rotacionadas entre produtos)
const DESCRIPTIONS = {
  kimono: [
    'Kimono fabricado em tecido trançado de alta resistência com costura reforçada tripla. Ideal para treinos intensos e competições.',
    'Confeccionado em algodão premium com acabamento em ripstop nos pontos de maior tensão. Leve e confortável.',
    'Modelo aprovado pela CBJJ para competições. Gramatura ideal para desempenho sem comprometer a durabilidade.',
    'Corte anatômico que permite ampla movimentação. Gola em EVA de alta densidade com borracha interna.',
  ],
  acessorios: [
    'Produto oficial da equipe de Jiu-Jitsu da Unicamp. Material de alta qualidade e durabilidade.',
    'Design exclusivo BJJ Unicamp. Perfeito para o dia a dia do praticante.',
    'Essencial para o treino. Qualidade comprovada por nossos atletas.',
    'Acessório indispensável para quem treina com seriedade. Feito para durar.',
  ],
  equipamentos: [
    'Equipamento profissional para treinamento funcional e específico de Jiu-Jitsu.',
    'Material de alta resistência ideal para academias e treinos em casa.',
    'Produto selecionado pela nossa equipe técnica para complementar o treino no tatame.',
    'Equipamento durável e de fácil manutenção. Garantia de qualidade.',
  ],
  'colecao-infantil': [
    'Desenvolvido especialmente para jovens praticantes. Tecido leve e confortável para o dia a dia no tatame.',
    'Produto infantil com a mesma qualidade da linha adulta. Cores vibrantes e design divertido.',
    'Ideal para crianças de 4 a 14 anos. Material resistente que acompanha o crescimento.',
    'Coleção infantil oficial BJJ Unicamp. Perfeito para os pequenos guerreiros do tatame.',
  ],
};

function getImagePair(index) {
  return IMAGE_PAIRS[index % IMAGE_PAIRS.length];
}

function getDescription(category, index) {
  const descs = DESCRIPTIONS[category];
  return descs[index % descs.length];
}

function slugify(text) {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

async function seedMockData() {
  console.log('=== Seed Mock: Criando dados de teste ===\n');

  // 1. Criar categorias
  console.log('Criando categorias...');
  const categoryDocIds = {};

  for (const cat of NEW_CATEGORIES) {
    // Checar se já existe
    const existing = await strapi.documents('api::categoria-produto.categoria-produto').findMany({
      filters: { slug: cat.slug },
    });

    if (existing.length > 0) {
      console.log(`  [skip] Categoria "${cat.name}" já existe (${existing[0].documentId})`);
      categoryDocIds[cat.slug] = existing[0].documentId;
      continue;
    }

    const created = await strapi.documents('api::categoria-produto.categoria-produto').create({
      data: {
        slug: cat.slug,
        name: cat.name,
      },
      status: 'published',
    });

    categoryDocIds[cat.slug] = created.documentId;
    console.log(`  [ok] Categoria "${cat.name}" criada (${created.documentId})`);
  }

  console.log('');

  // 2. Buscar os file objects para poder vincular como media
  console.log('Buscando imagens existentes...');
  const fileObjects = {};
  for (const fileId of PRODUCT_IMAGE_IDS) {
    const file = await strapi.query('plugin::upload.file').findOne({ where: { id: fileId } });
    if (file) {
      fileObjects[fileId] = file;
    } else {
      console.warn(`  [warn] Arquivo id=${fileId} não encontrado no banco`);
    }
  }
  console.log(`  Encontradas ${Object.keys(fileObjects).length} imagens\n`);

  // 3. Criar produtos
  let totalCreated = 0;
  let totalSkipped = 0;

  for (const [catSlug, products] of Object.entries(MOCK_PRODUCTS)) {
    console.log(`Criando produtos para "${catSlug}" (${products.length} itens)...`);

    for (let i = 0; i < products.length; i++) {
      const product = products[i];
      const slug = slugify(product.title);

      // Checar se já existe
      const existing = await strapi.documents('api::produto.produto').findMany({
        filters: { slug },
      });

      if (existing.length > 0) {
        totalSkipped++;
        continue;
      }

      const imagePair = getImagePair(i);
      const description = getDescription(catSlug, i);

      // Buscar o document_id da categoria
      const catDocId = categoryDocIds[catSlug];

      // Criar o produto via Documents API
      const created = await strapi.documents('api::produto.produto').create({
        data: {
          slug,
          title: product.title,
          description,
          price: product.price,
          sizes: product.sizes,
          // Relação com categoria via documentId
          categoria: catDocId,
          // Media: passar o id do arquivo
          cover: fileObjects[imagePair.cover]?.id || null,
          gallery: imagePair.gallery.map((fid) => fileObjects[fid]?.id).filter(Boolean),
        },
        status: 'published',
      });

      totalCreated++;

      if ((i + 1) % 5 === 0) {
        process.stdout.write(`  ${i + 1}/${products.length} criados\n`);
      }
    }

    console.log(`  Finalizado: ${products.length} produtos para "${catSlug}"`);
  }

  console.log(`\n=== Resumo ===`);
  console.log(`Categorias: ${NEW_CATEGORIES.length}`);
  console.log(`Produtos criados: ${totalCreated}`);
  console.log(`Produtos ignorados (já existiam): ${totalSkipped}`);
  console.log(`Total esperado: ${Object.values(MOCK_PRODUCTS).reduce((s, p) => s + p.length, 0)}`);
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  console.log('Inicializando Strapi...');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    await seedMockData();
  } catch (error) {
    console.error('Erro durante o seed:', error);
  }

  await app.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
