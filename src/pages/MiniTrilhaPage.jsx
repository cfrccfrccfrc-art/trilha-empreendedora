import { useParams } from 'react-router-dom';
import precificacao from '../data/miniTrilhas/precificacao.json';
import capital from '../data/miniTrilhas/capital.json';
import canais from '../data/miniTrilhas/canais.json';
import projecao from '../data/miniTrilhas/projecao.json';
import MiniTrilha from '../components/MiniTrilha';
import PageHeader from '../components/PageHeader';
import Card from '../components/Card';

const DATA_BY_SLUG = {
  precificacao,
  capital,
  canais,
  projecao,
};

export default function MiniTrilhaPage() {
  const { slug } = useParams();
  const data = DATA_BY_SLUG[slug];
  if (!data) {
    return (
      <div className="space-y-5">
        <PageHeader title="Mini-trilha não encontrada" />
        <Card>
          <p className="text-secondary text-sm">
            Mini-trilhas disponíveis: precificação, capital, canais, projeção.
          </p>
        </Card>
      </div>
    );
  }
  return <MiniTrilha data={data} />;
}
