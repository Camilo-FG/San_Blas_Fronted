import React from 'react';
import './DonacionInfo.css';

interface Props {
    sinpe: string;
    cuentaBancaria: string;
    banco: string;
    onDonarInsumos: () => void;
}

export default function DonacionInfo({ sinpe, cuentaBancaria, banco, onDonarInsumos }: Props): React.JSX.Element {
    return (
        <div className="info-container">

            {/* Encabezado */}
            <div className="info-encabezado">
                <h2 className="info-titulo">
                    ✝ Apoya a Nuestra Parroquia
                </h2>
                <p className="info-descripcion">
                    Tu generosidad nos permite continuar con nuestra misión. Podés realizar
                    tu donación económica mediante los siguientes medios:
                </p>
            </div>


            <div className="info-grid">

                {/* Tarjeta SINPE */}
                <div className="tarjeta-donacion">
                    <div className="tarjeta-badge">
                        <span className="tarjeta-badge-text">
                            SINPE MÓVIL
                        </span>
                    </div>
                    <p className="tarjeta-subtexto">
                        Para montos pequeños
                    </p>
                    <p className="tarjeta-dato sinpe">
                        {sinpe}
                    </p>
                </div>

                {/* Tarjeta Cuenta Bancaria */}
                <div className="tarjeta-donacion">
                    <div className="tarjeta-badge">
                        <span className="tarjeta-badge-text">
                            CUENTA BANCARIA
                        </span>
                    </div>
                    <p className="tarjeta-subtexto">
                        Para montos mayores — {banco}
                    </p>
                    <p className="tarjeta-dato cuenta">
                        {cuentaBancaria}
                    </p>
                </div>
            </div>

            {/* Botón */}
            <button onClick={onDonarInsumos} className="btn-donar-insumos">
                Donar Insumos
            </button>
        </div>
    );
}