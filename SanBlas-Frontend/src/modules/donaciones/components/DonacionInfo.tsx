import React from 'react'

interface Props {
    sinpe: string
    cuentaBancaria: string
    banco: string
    onDonarInsumos: () => void
}

export default function DonacionInfo({ sinpe, cuentaBancaria, banco, onDonarInsumos }: Props): React.JSX.Element {
    return (
        <div style={{ maxWidth: '800px', margin: '0 auto' }}>

            {/* Encabezado */}
            <div style={{
                backgroundColor: '#003366',
                borderRadius: '16px',
                padding: '40px',
                marginBottom: '24px',
                textAlign: 'center'
            }}>
                <h2 style={{ color: '#D4AF37', fontSize: '2rem', margin: '0 0 12px' }}>
                    ✝ Apoya a Nuestra Parroquia
                </h2>
                <p style={{ color: '#FFFFFF', fontSize: '1rem', margin: 0, opacity: 0.9 }}>
                    Tu generosidad nos permite continuar con nuestra misión. Podés realizar
                    tu donación económica mediante los siguientes medios:
                </p>
            </div>

            {/* Tarjetas lado a lado */}
            <div style={{
                display: 'grid',
                gridTemplateColumns: '1fr 1fr',
                gap: '20px',
                marginBottom: '24px'
            }}>

                {/* Tarjeta SINPE */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #D4AF37',
                    borderRadius: '14px',
                    padding: '28px',
                    boxShadow: '0 4px 12px rgba(0,51,102,0.08)'
                }}>
                    <div style={{
                        backgroundColor: '#003366',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        display: 'inline-block',
                        marginBottom: '16px'
                    }}>
                        <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            💳 SINPE MÓVIL
                        </span>
                    </div>
                    <p style={{ color: '#1F2937', margin: '0 0 8px', fontSize: '0.9rem' }}>
                        Para montos pequeños
                    </p>
                    <p style={{
                        color: '#003366',
                        fontSize: '1.8rem',
                        fontWeight: 'bold',
                        margin: '0',
                        letterSpacing: '1px'
                    }}>
                        {sinpe}
                    </p>
                </div>

                {/* Tarjeta Cuenta Bancaria */}
                <div style={{
                    backgroundColor: '#FFFFFF',
                    border: '2px solid #D4AF37',
                    borderRadius: '14px',
                    padding: '28px',
                    boxShadow: '0 4px 12px rgba(0,51,102,0.08)'
                }}>
                    <div style={{
                        backgroundColor: '#003366',
                        borderRadius: '8px',
                        padding: '8px 14px',
                        display: 'inline-block',
                        marginBottom: '16px'
                    }}>
                        <span style={{ color: '#D4AF37', fontWeight: 'bold', fontSize: '0.85rem' }}>
                            🏦 CUENTA BANCARIA
                        </span>
                    </div>
                    <p style={{ color: '#1F2937', margin: '0 0 8px', fontSize: '0.9rem' }}>
                        Para montos mayores — {banco}
                    </p>
                    <p style={{
                        color: '#003366',
                        fontSize: '1.2rem',
                        fontWeight: 'bold',
                        margin: '0',
                        letterSpacing: '1px'
                    }}>
                        {cuentaBancaria}
                    </p>
                </div>
            </div>

            {/* Botón */}
            <button
                onClick={onDonarInsumos}
                style={{
                    backgroundColor: '#D4AF37',
                    color: '#003366',
                    border: 'none',
                    padding: '16px 40px',
                    borderRadius: '10px',
                    fontSize: '1rem',
                    fontWeight: 'bold',
                    cursor: 'pointer',
                    width: '100%',
                    letterSpacing: '0.5px',
                    boxShadow: '0 4px 12px rgba(212,175,55,0.3)',
                    transition: 'opacity 0.2s'
                }}
                onMouseEnter={e => (e.currentTarget.style.opacity = '0.85')}
                onMouseLeave={e => (e.currentTarget.style.opacity = '1')}
            >
                🤲 Donar Insumos
            </button>
        </div>
    )
}