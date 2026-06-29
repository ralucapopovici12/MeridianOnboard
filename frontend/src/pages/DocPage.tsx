import { ArrowLeft, Clock, FileText } from 'lucide-react'
import { Link, useParams } from 'react-router-dom'
import { getDoc } from '../lib/docs'

export function DocPage() {
  const { id } = useParams<{ id: string }>()
  const doc = id ? getDoc(id) : undefined

  if (!doc) {
    return (
      <div>
        <Link to="/" className="doc-back">
          <ArrowLeft size={15} /> Back to Home
        </Link>
        <div className="empty-state">That document doesn’t exist.</div>
      </div>
    )
  }

  return (
    <div className="doc-page fade-up">
      <Link to="/" className="doc-back">
        <ArrowLeft size={15} /> Policies &amp; resources
      </Link>

      <div className="doc-head">
        <span className="doc-head__icon"><FileText size={20} /></span>
        <div>
          <h1 className="doc-title">{doc.title}</h1>
          <p className="doc-summary">{doc.summary}</p>
          <div className="doc-meta">
            <span><Clock size={12} /> {doc.readMins} min read</span>
            <span className="doc-meta__sep">·</span>
            <span>{doc.updated}</span>
          </div>
        </div>
      </div>

      <article className="doc-body">
        {doc.sections.map((s, i) => (
          <section key={i} className="doc-section">
            {s.heading && <h2 className="doc-section__heading">{s.heading}</h2>}
            {s.body?.map((p, j) => (
              <p key={j} className="doc-p">{p}</p>
            ))}
            {s.bullets && (
              <ul className="doc-list">
                {s.bullets.map((b, j) => (
                  <li key={j}>{b}</li>
                ))}
              </ul>
            )}
          </section>
        ))}
      </article>
    </div>
  )
}
