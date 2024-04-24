import React, { useEffect, useState } from 'react';
import 'amazon-connect-streams';

// Componente que muestra la tabla de agentes
const AgentTable = ({ agents }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                </tr>
            </thead>
            <tbody>
                {agents.map((agent) => (
                    <tr key={agent.name}>
                        <td>{agent.name}</td>
                        <td>{agent.status}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    );
};

const AgentDashboard = () => {
    const [agents, setAgents] = useState([]);

    useEffect(() => {
        const ccpContainer = document.getElementById('ccp-container');
        if (!ccpContainer.firstChild) { // Ensure the CCP is initialized only if there's no iframe already
            window.connect.core.initCCP(ccpContainer, {
                ccpUrl: 'https://ss2cc.my.connect.aws/connect/ccp-v2/',
                loginPopup: true,
                region: 'us-east-1',
                softphone: {
                    allowFramedSoftphone: true
                }
            });
        }

        const agentUpdateHandler = (agent) => {
            console.log('Agent updated:', agent.getName(), agent.getStatus().name);

            const newAgent = {
                name: agent.getName(),
                status: agent.getStatus().name
            };

            setAgents(prevAgents => {
                const index = prevAgents.findIndex(a => a.name === newAgent.name);
                if (index > -1) {
                    // Actualizar el estado del agente existente
                    return prevAgents.map((item, idx) => idx === index ? newAgent : item);
                } else {
                    // Agregar un nuevo agente si no estaba previamente en la lista
                    return [...prevAgents, newAgent];
                }
            });
        };

        const subscription = window.connect.agent(agent => {
            // Subscribe to state changes using the onStateChange method
            agent.onStateChange(agentStateChange => {
                console.log(`State change detected. Old State: ${agentStateChange.oldState}, New State: ${agentStateChange.newState}`);
                agentUpdateHandler(agentStateChange.agent);
            });
        });

        return () => {
            subscription.unsubscribe(); // Clean up the subscription when the component unmounts
        };
    }, []);

    return (
        <div>
            <div id="ccp-container" style={{ display: 'none' }}></div>
            <AgentTable agents={agents} />
        </div>
    );
};

export default AgentDashboard;
