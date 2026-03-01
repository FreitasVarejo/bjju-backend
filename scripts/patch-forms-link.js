'use strict';

/**
 * Script para atualizar os produtos existentes no banco local:
 * 50% recebem um formsLink mockado, 50% ficam sem.
 *
 * Rodar com: node scripts/patch-forms-link.js
 */

const MOCK_FORMS_LINK = 'https://forms.gle/mock-encomenda-teste';

async function patchFormsLinks() {
  console.log('=== Patch formsLink: 50% aberto / 50% fechado ===\n');

  const all = await strapi.documents('api::produto.produto').findMany({
    pagination: { limit: 500 },
    status: 'published',
  });

  if (all.length === 0) {
    console.log('Nenhum produto encontrado no banco. Rode o seed primeiro.');
    return;
  }

  // Ordenar por documentId para resultado determinístico
  const sorted = [...all].sort((a, b) => a.documentId.localeCompare(b.documentId));
  const cutoff = Math.ceil(sorted.length / 2);
  const withForms = sorted.slice(0, cutoff);
  const withoutForms = sorted.slice(cutoff);

  console.log(`Total de produtos: ${sorted.length}`);
  console.log(`Com formsLink:     ${withForms.length}`);
  console.log(`Sem formsLink:     ${withoutForms.length}\n`);

  // Atualizar metade COM link
  console.log('Aplicando formsLink nos primeiros 50%...');
  for (const product of withForms) {
    await strapi.documents('api::produto.produto').update({
      documentId: product.documentId,
      data: { formsLink: MOCK_FORMS_LINK },
      status: 'published',
    });
  }
  console.log(`  [ok] ${withForms.length} produtos atualizados com formsLink`);

  // Limpar link na outra metade (caso script seja rodado mais de uma vez)
  console.log('Limpando formsLink nos demais 50%...');
  for (const product of withoutForms) {
    await strapi.documents('api::produto.produto').update({
      documentId: product.documentId,
      data: { formsLink: null },
      status: 'published',
    });
  }
  console.log(`  [ok] ${withoutForms.length} produtos sem formsLink`);

  console.log('\n=== Patch concluído ===');
}

async function main() {
  const { createStrapi, compileStrapi } = require('@strapi/strapi');

  console.log('Inicializando Strapi...');
  const appContext = await compileStrapi();
  const app = await createStrapi(appContext).load();

  app.log.level = 'error';

  try {
    await patchFormsLinks();
  } catch (error) {
    console.error('Erro durante o patch:', error);
  }

  await app.destroy();
  process.exit(0);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
