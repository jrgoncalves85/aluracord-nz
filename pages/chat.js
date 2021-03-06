import { Box, Text, TextField, Image, Button } from '@skynexui/components';
import React, { useState } from 'react';
import appConfig from '../config.json';
import { useRouter } from 'next/router';
import { createClient } from '@supabase/supabase-js';
import { ButtonSendSticker } from '../src/components/ButtonSendSticker';

const SUPABEASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJyb2xlIjoiYW5vbiIsImlhdCI6MTY0MzI5MjE5NCwiZXhwIjoxOTU4ODY4MTk0fQ.YZ_d7W5EK13xYk2WmCyXQq4QyTUGme3WR7AwXOe4qdQ';
const SUPABSE_URL = 'https://gkoicohzqagfplygtnqv.supabase.co';
const supabaseClient = createClient(SUPABSE_URL,SUPABEASE_ANON_KEY);

function escutaMensagensEmTempoReal(adicionaMensagem) {
    return supabaseClient
        .from('mensagens')
        .on('INSERT', (respostaLive) => {
            adicionaMensagem(respostaLive.new);
        })
        .subscribe();
}

export default function ChatPage() {
    const roteamento = useRouter();
    const usuarioLogado = roteamento.query.username;
    // console.log('usuarioLogado', usuarioLogado);
    const [mensagem, setMensagem] = React.useState('');
    const [listaDeMensagens, setListaDeMensagens] = React.useState([ ]);

    React.useEffect(() => {
        supabaseClient
            .from('mensagens')
            .select('*')
            .order('id', { ascending:false })
            .then(({ data }) => {
                // console.log('Dados da consulta', data);
                setListaDeMensagens(data);
            }); 

            const subscription = escutaMensagensEmTempoReal((novaMensagem) => {
                console.log('Nova mensagem:', novaMensagem);
                console.log('listaDeMensagens:', listaDeMensagens);
                
                setListaDeMensagens((valorAtualDaLista) => {
                    console.log('valorAtualDaLista:', valorAtualDaLista);
                    return [
                        novaMensagem,
                        ...valorAtualDaLista,
                    ]
                });
            });
          
            return () => {
                subscription.unsubscribe();
            }     
    }, []);

    function handleNovaMensagem(novaMensagem) {
        const mensagem = {
            de: usuarioLogado,
            texto: novaMensagem,
        };

        supabaseClient
            .from('mensagens')
            .insert([
                // tem que ser um objeto com os mesmos campos do supabase
                mensagem
            ])
            .then(({ data }) => {
                console.log('Criando mensagem: ', data);
            });

        setMensagem('');
    }
  
    function handleDeleteMessage(mensagemAtual) {
        const messageId = mensagemAtual.id
        const messageListFiltered = listaDeMensagens.filter((messageFiltered) => {
            return messageFiltered.id != messageId
        })
        supabaseClient
            .from('mensagens')
            .delete()
            .match({ id: messageId })
            .then(({ data }) => {
                console.log('Apagando mensagem: ', data);
            });
        setListaDeMensagens(messageListFiltered);
    } 

    return (
        <Box
            styleSheet={{
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                backgroundColor: appConfig.theme.colors.primary[100],
                backgroundImage: 'url(https://uploaddeimagens.com.br/images/003/696/547/original/ketchup-na-pizza.jpg?1643391926)',
                backgroundRepeat: 'no-repeat', backgroundSize: 'cover', backgroundBlendMode: 'multiply',
                color: appConfig.theme.colors.neutrals['000']
            }}
        >
            <Box
                styleSheet={{
                    display: 'flex',
                    flexDirection: 'column',
                    flex: 1,
                    boxShadow: '0 2px 10px 0 rgb(0 0 0 / 20%)',
                    borderRadius: '5px',
                    backgroundColor: appConfig.theme.colors.neutrals[700],
                    height: '90%',
                    maxWidth: '95%',
                    maxHeight: '95vh',
                    padding: '32px',
                }}
            >
                <Header />
                <Box
                    styleSheet={{
                        position: 'relative',
                        display: 'flex',
                        flex: 1,
                        height: '80%',
                        backgroundColor: appConfig.theme.colors.neutrals[600],
                        flexDirection: 'column',
                        borderRadius: '5px',
                        padding: '16px',
                    }}
                >

                    <MessageList mensagens={listaDeMensagens} handleDeleteMessage={handleDeleteMessage} />
                    
                    <Text 
                        styleSheet={{
                            width: '100%',      
                            borderRadius: '5px',
                            padding: '5px',
                            marginRight: '10px',
                            marginTop: '20px',                            
                            color: appConfig.theme.colors.neutrals[100],
                        }}
                    >
                        Envie na caixa de texto abaixo a sua opini??o ou utilize um dos nossos sticker
                    </Text>
                   
                    <Box
                        as="form"
                        styleSheet={{
                            display: 'flex',
                            alignItems: 'center',
                        }}
                    >
                        <TextField
                            value={mensagem}
                            onChange={(event) => {
                                const valor = event.target.value;
                                setMensagem(valor);
                            }}
                            onKeyPress={(event) => {
                                if (event.key === 'Enter') {
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);
                                }
                            }}
                            placeholder="..."
                            type="textarea"
                            styleSheet={{
                                width: '100%',
                                border: '0',
                                resize: 'none',
                                borderRadius: '5px',
                                padding: '6px 8px',
                                backgroundColor: appConfig.theme.colors.neutrals[800],
                                marginRight: '12px',
                                color: appConfig.theme.colors.neutrals[200],
                            }}
                        />
                        <ButtonSendSticker 
                            onStickerClick={(sticker) => {
                                // console.log('Salva esse sticker no banco', sticker);
                                handleNovaMensagem(':sticker: ' + sticker)
                            }}   
                        />
                        <Button iconName="arrowRight"
                            onClick={(event) => {                                
                                    event.preventDefault();
                                    handleNovaMensagem(mensagem);                                                  
                            }}
                            type='submit'                          
                            size='xl' 
                            styleSheet={{
                                borderRadius: '50%',                                
                                minWidth: '50px',
                                minHeight: '50px',                                
                                marginBottom: '8px',
                                marginLeft: '5px',                                                              
                            }}                                                                                         
                            buttonColors={{
                                contrastColor: appConfig.theme.colors.neutrals["000"],
                                mainColor: appConfig.theme.colors.primary[500],
                                mainColorLight: appConfig.theme.colors.primary[900],
                                mainColorStrong: appConfig.theme.colors.primary[600],
                            }}
                        />
                    </Box>
                </Box>
            </Box>
        </Box>
    )
}

function Header() {
    return (
        <>
            <Box styleSheet={{ width: '100%', marginBottom: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }} >
                <Text variant='heading3'>
                    O que voc?? acha de colocar ketchup na pizza?
                </Text>
                <Button
                    variant='tertiary'
                    colorVariant='neutral'
                    styleSheet={{                        
                        fontWeight: 'bold',
                        marginLeft: 'auto',
                        color: '#333',                        
                        backgroundColor: 'rgba(255, 255, 255, 0.9)',
                        width: '60px',
                        height: '30px',                                    
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                    }}           
                    label='Sair'
                    href="/"
                />
            </Box>
        </>
    )
}

function MessageList(props) {

    const handleDeleteMessage = props.handleDeleteMessage
    
    return (
        <Box
            tag="ul"
            styleSheet={{
                overflow: 'auto',
                display: 'flex',
                flexDirection: 'column-reverse',
                flex: 1,
                color: appConfig.theme.colors.neutrals["000"],
                marginBottom: '16px',
            }}
        >
            {props.mensagens.map((mensagem) => {
                return (
                    <Text
                        key={mensagem.id}
                        tag="li"
                        styleSheet={{
                            borderRadius: '5px',
                            padding: '6px',
                            marginBottom: '12px',
                            wordBreak: 'break-word',
                            hover: {
                                backgroundColor: 'rgba(145, 163, 182, 0.09)',
                            }
                        }}
                    >
                        <Box
                            styleSheet={{
                                marginBottom: '8px',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'flex-start',
                            }}
                        >
                            <Image
                                styleSheet={{
                                    width: {xs: '23px', md: '40px'},
                                    height: {xs: '23px', md: '40px'},
                                    borderRadius: '50%',
                                    marginRight: {xs: '10px', md: '16px'}, 
                                }}
                                src={`https://github.com/${mensagem.de}.png`}
                            />
                            <Text tag="strong">
                                {mensagem.de}
                            </Text>
                            <Text
                                styleSheet={{
                                    fontSize: '10px',
                                    marginLeft: '8px',
                                    color: appConfig.theme.colors.neutrals[300],
                                }}
                                tag="span"
                            >
                                {(new Date().toLocaleDateString())}
                            </Text>
                            <Button
                                onClick={(event) => {                                
                                        event.preventDefault();
                                        handleDeleteMessage(mensagem);                                                  
                                }}
                                label="X"
                                data-id={mensagem.id}                               
                                styleSheet={{
                                    fontSize: '15px',
                                    fontWeight: 'bold',
                                    marginLeft: 'auto',
                                    color: '#FFF',
                                    backgroundColor: 'rgba(0,0,0,.5)',
                                    width: '20px',
                                    height: '20px',                                    
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    cursor: 'pointer',
                                }}                               
                            >
                            </Button>
                        </Box>                        
                        {mensagem.texto.startsWith(':sticker:')
                            ? (
                                <Image src={mensagem.texto.replace(':sticker:', '')} />
                            )
                            : (
                                mensagem.texto
                            )
                        }                    
                    </Text>
                );
            })}
        </Box>
    )
}