import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { contextAPI } from '../../services/api'; // you'll define this
import { format } from 'date-fns';

const ContextDetail = () => {
    const { id } = useParams();
    const [context, setContext] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchContextDetail = async () => {
            try {
                setLoading(true);
                setError(null);

                const response = await contextAPI.getContextDetail(id);
                const data = {
                    id: response.content.id,
                    topic: response.content.topic || '',
                    image_url: response.content.image_url || '',
                    content: response.content.content || '',
                    tags: Array.isArray(response.content.tags) ? response.content.tags : [],
                    upsc_relevance: response.content.upsc_relevance || '',
                    created_at: response.content.created_at ? new Date(response.content.created_at) : new Date()
                };

                setContext(data);
            } catch (err) {
                console.error('Error fetching context detail:', err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        if (id) {
            fetchContextDetail();
        }
    }, [id]);

    const formatDate = (date) => {
        try {
            return format(date, 'MMM dd, yyyy');
        } catch {
            return '';
        }
    };

    if (loading) {
        return (
            <div className="text-center py-5">
                <div className="spinner-border text-primary" role="status">
                    <span className="visually-hidden">Loading...</span>
                </div>
            </div>
        );
    }

    if (!context) {
        return (
            <div className="text-center py-5">
                <h2>Context not found</h2>
                <p className="text-muted">The context you’re looking for doesn’t exist.</p>
                <Link to="/context" className="btn btn-primary">Back to All Contexts</Link>
            </div>
        );
    }

    return (
        <div className="context-container">
            {/* Breadcrumb */}
            <nav aria-label="breadcrumb" className="mb-3">
                <ol className="breadcrumb">
                    <li className="breadcrumb-item"><Link to="/">Home</Link></li>
                    <li className="breadcrumb-item"><Link to="/context">All Contexts</Link></li>
                    <li className="breadcrumb-item active" aria-current="page">Context</li>
                </ol>
            </nav>

            {/* Header */}
            <header className="context-header mb-4">
                <h1 className="context-topic">{context.topic}</h1>
                <div className="context-meta text-muted">
                    Created at: {formatDate(context.created_at)}
                </div>
            </header>

            {/* Image */}
            {context.image_url && (
                <div className="article-image mb-4">
                    <img src={context.image_url} alt={context.topic} />
                </div>
            )}

            {/* Main Content */}
            <article className="context-content mb-5">
                {typeof context.content === 'object' ? (
                    <>
                        {context.content.summary && (
                            <section>
                                <h3 className="font-semibold text-lg mb-2">Summary</h3>
                                <p>{context.content.summary}</p>
                            </section>
                        )}
                        {context.content.backgrounder && (
                            <section className="mb-4">
                                <h3 className="font-semibold text-lg mb-2">Background</h3>
                                {context.content.backgrounder.split('\n').map((p, i) => (
                                    <p key={i} className="mb-1">{p}</p>
                                ))}
                            </section>
                        )}


                    </>
                ) : (
                    context.content.split('\n').map((p, i) => <p key={i}>{p}</p>)
                )}
            </article>

            {/* UPSC Relevance */}
            {context.upsc_relevance && (
                <div className="content-section mb-5">
                    <h3 className="section-heading">UPSC Relevance</h3>
                    <p>{context.upsc_relevance}</p>
                </div>
            )}

            {/* Tags */}
            {context.tags.length > 0 && (
                <div className="context-tags mb-4">
                    {context.tags.map((tag, i) => (
                        <Link key={i} to={`/context?tag=${encodeURIComponent(tag)}`} className="tag-badge me-2 mb-2">
                            {tag}
                        </Link>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ContextDetail;
