function GlobalStyle() {
    return (
        <style global jsx >{`
            *{
                margin:0;
                padding:0;
                background-color:silver;
            }
            body{
                font-family: sans-serif;
            }
        `}</style>
    );
}

function Titulo(props) {
    console.log(props);
    const Tag = props.tag;
    return (
        <>
            <Tag>{props.children}</Tag>
            <style jsx >{`
                ${Tag} {
                    color: red;
                    font-size: 24px;
                }
            `}</style> 
        </>
    );

}

function HomePage() {
    return (
        <div>
            <GlobalStyle />
            <Titulo tag="h2">Aluracord - New Zealand</Titulo>
            <p>Seja Bem-Vindo!!</p>             
        </div>
        
    )
}
  
export default HomePage