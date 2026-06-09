import { useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import archetypesData from '../data/archetypes.json';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';
import Button from '../components/Button';
import JsonLd from '../components/JsonLd';

// Índice indexável dos 15 perfis. Cada item linka pra /perfis/<id>. Boa
// landing pra busca tipo "perfis de microempreendedor", "tipos de empreendedor",
// "diagnóstico de negócio".
export default function ArchetypesIndex() {
  const navigate = useNavigate();
  const list = useMemo(
    () => archetypesData.filter((a) => a.status === 'active'),
    []
  );

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'Os 15 perfis de microempreendedor brasileiro',
    description:
      'Os 15 caminhos que a Trilha Empreendedora identifica no diagnóstico de 5 minutos. Cada perfil descreve uma situação comum, sinais típicos e o que costuma destravar.',
    inLanguage: 'pt-BR',
    isAccessibleForFree: true,
    url: 'https://trilhaempreendedora.com.br/perfis',
    publisher: { '@id': 'https://trilhaempreendedora.com.br/#organization' },
    mainEntity: {
      '@type': 'ItemList',
      itemListElement: list.map((a, i) => ({
        '@type': 'ListItem',
        position: i + 1,
        url: `https://trilhaempreendedora.com.br/perfis/${a.id}`,
        name: a.name.replace(/"/g, ''),
      })),
    },
  };

  return (
    <div className="space-y-4">
      <JsonLd id="archetypes-index" schema={schema} />

      <PageHeader
        accent="Perfis"
        title="Os 15 caminhos do microempreendedor"
        subtitle="O diagnóstico identifica em qual desses cenários você está hoje. Cada perfil tem uma trilha de 30 dias pensada pra ele."
      />

      <Card tone="soft">
        <p className="text-secondary text-sm leading-relaxed">
          Não é classificação fixa. É um retrato do momento. Mês que vem
          pode ser outro, dependendo do que você vai mexendo. Reconheceu
          algum? Clica pra ler com calma e confirma com o diagnóstico.
        </p>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {list.map((a) => (
          <Card
            key={a.id}
            interactive
            tone="soft"
            className="h-full"
            onClick={() => navigate(`/perfis/${a.id}`)}
          >
            <h3 className="font-bold text-ink leading-snug mb-2">
              {a.name}
            </h3>
            {a.commonPain && (
              <p className="text-secondary text-sm leading-relaxed line-clamp-3">
                {a.commonPain}
              </p>
            )}
            <p className="text-primary text-sm font-semibold mt-3">
              Ler perfil →
            </p>
          </Card>
        ))}
      </div>

      <Card tone="ink" className="text-center">
        <h3 className="font-bold text-paper text-lg leading-snug mb-2">
          Não sabe em qual perfil você está?
        </h3>
        <p className="text-paper/70 text-sm leading-relaxed mb-4">
          5 minutos de diagnóstico identificam seu perfil entre esses 13.
        </p>
        <Button
          onClick={() => navigate('/diagnostico')}
          className="w-full bg-highlight text-ink hover:bg-highlight/90 shadow-lg"
        >
          Começar diagnóstico
        </Button>
      </Card>

      <Button
        variant="ghost"
        onClick={() => navigate('/')}
        className="w-full"
      >
        ← Voltar para o início
      </Button>
    </div>
  );
}
