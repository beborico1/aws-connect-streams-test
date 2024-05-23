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
    const [incomingContact, setIncomingContact] = useState(null);
    const [currentConnection, setCurrentConnection] = useState(null);

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

        const contactSubscription = window.connect.contact(contact => {
            console.log('Contact:', contact);
            setIncomingContact(contact);

            contact.onIncoming(function (contact) {
                console.log('Incoming contact:', contact);
            });
            contact.onConnecting(function (contact) {
                console.log('Incoming contact connecting:', contact);
            }
            );
            contact.onAccepted(function (contact) {
                console.log('Incoming contact accepted:', contact);
            }
            );
            contact.onConnected(function (contact) {
                console.log('Incoming contact connected:', contact);
            }
            );
            contact.onEnded(function (contact) {
                console.log('Incoming contact ended:', contact);
            }
            );
        });

        // const connectionSubscription = window.connect.connection(connection => {
        //     console.log('Connection detected:',
        //         connection.getContactId(),
        //         connection.getEndpoint().phoneNumber,
        //         connection.getType(),
        //         connection.getStatus().name
        //     );

        //     setCurrentConnection(connection);
        // });

        console.log("WINDOWCONNECT", window.connect)

        const subscription = window.connect.agent(agent => {
            agent.onStateChange(agentStateChange => {
                console.log(`State change detected. Old State: ${agentStateChange.oldState}, New State: ${agentStateChange.newState}`);
                agentUpdateHandler(agentStateChange.agent);
            });
        });

        return () => {
            // connectionSubscription.unsubscribe();
            subscription.unsubscribe();
            contactSubscription.unsubscribe();
        };
    }, []);

    const changeAgentState = (agentName, targetState) => {
        // Usamos la función callback para obtener la referencia del agente
        window.connect.agent(agent => {
            console.log('Agent:', agent);

            const states = agent.getAgentStates();
            console.log('States:', states);

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
        });
    };

    return (
        <div>
            <div id="ccp-container" style={{ display: 'none' }}></div>
            {incomingContact && <div>
                <h3>Incoming Contact</h3>
                <p>Contact ID: {incomingContact.getContactId()}</p>
                <button onClick={() => incomingContact.accept({
                    success: () => console.log('Contact accepted'),
                    failure: (err) => console.error('Failed to accept contact:', err)
                })}>Accept</button>
                <button onClick={() => {
                    console.log("1 CONTACT", incomingContact.getAgentConnection().destroy())
                }
                }>Get Connection</button>
            </div>}

            {/* <button onClick={() => window.connect.Connection.destroy()}>Destroy Connection</button>
 */}

            {/* <button
                onClick={() => {
                    window.connect.contact.accept({
                        success: () => console.log('Contact accepted'),
                        failure: (err) => console.error('Failed to accept contact:', err)
                    })
                }
                }>
                Accept
            </button> */}


            <AgentTable agents={agents} changeAgentState={changeAgentState} />
        </div >
    );
};

export default AgentDashboard;
