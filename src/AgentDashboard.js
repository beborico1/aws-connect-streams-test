import React, { useEffect, useState } from 'react';
import 'amazon-connect-streams';

const AgentTable = ({ agents, changeAgentState }) => {
    return (
        <table>
            <thead>
                <tr>
                    <th>Nombre</th>
                    <th>Estado</th>
                    <th>Acción</th>
                </tr>
            </thead>
            <tbody>
                {agents.map((agent) => (
                    <tr key={agent.name}>
                        <td>{agent.name}</td>
                        <td>{agent.status}</td>
                        <td>
                            {agent.status === 'Available' ? (
                                <button onClick={() => changeAgentState(agent.name, 'Offline')}>Go Offline</button>
                            ) : (
                                <button onClick={() => changeAgentState(agent.name, 'Available')}>Go Available</button>
                            )}
                        </td>
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
        if (!ccpContainer.firstChild) {
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
                    return prevAgents.map((item, idx) => idx === index ? newAgent : item);
                } else {
                    return [...prevAgents, newAgent];
                }
            });
        };

        const subscription = window.connect.agent(agent => {
            agent.onStateChange(agentStateChange => {
                console.log(`State change detected. Old State: ${agentStateChange.oldState}, New State: ${agentStateChange.newState}`);
                agentUpdateHandler(agentStateChange.agent);
            });
        });

        return () => {
            subscription.unsubscribe();
        };
    }, []);

    const changeAgentState = (agentName, targetState) => {
        const agent = window.connect.agent();
        const states = agent.getAgentStates();
        const desiredState = states.find(state => state.name === targetState);

        if (desiredState) {
            agent.setState(desiredState, {
                success: () => {
                    console.log(`State changed to ${desiredState.name}`);
                },
                failure: (err) => {
                    console.error('Failed to change state:', err);
                }
            }, { enqueueNextState: false });
        }
    };

    return (
        <div>
            <div id="ccp-container" style={{ display: 'none' }}></div>
            <AgentTable agents={agents} changeAgentState={changeAgentState} />
        </div>
    );
};

export default AgentDashboard;
