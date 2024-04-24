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
                {agents.map((agent, index) => (
                    <tr key={index}>
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
                ccpUrl: 'https://ss2cc.awsapps.com/connect/ccp-v2/',
                loginPopup: true,
                region: 'us-east-1',
                softphone: {
                    allowFramedSoftphone: true
                }
            });
        }

        const subscription = window.connect.agent(agent => {
            console.log("Agent name is", agent.getName());

            const newAgent = {
                name: agent.getName(),
                status: agent.getStatus().name
            };

            setAgents(prevAgents => [...prevAgents, newAgent]);
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    return (
        <div>
            <div id="ccp-container" style={{ width: '400px', height: '800px' }}></div>
            <AgentTable agents={agents} />
        </div>
    );
};

export default AgentDashboard;
