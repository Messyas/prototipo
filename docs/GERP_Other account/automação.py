import os
import pandas as pd

# Define os caminhos de entrada e saída
pasta_origem = r"X:\2. FIELD\4. If cost\New folder"
arquivo_saida = os.path.join(pasta_origem, "consolidado_final.csv")

# Lista todos os arquivos CSV da pasta
arquivos_csv = [f for f in os.listdir(pasta_origem) if f.endswith(".csv")]

if not arquivos_csv:
    print("Nenhum arquivo CSV encontrado na pasta especificada.")
else:
    print(f"Encontrados {len(arquivos_csv)} arquivos. Iniciando união...")

    # Lista para armazenar os dataframes
    lista_dataframes = []

    # Parâmetros robustos para leitura de CSVs do Excel/Sistemas brasileiros
    opcoes_leitura = {
        "sep": None,             # Detecta automaticamente se o separador é ',' ou ';'
        "engine": "python",      # Engine mais flexível para evitar erros de tokenização
        "on_bad_lines": "skip",  # Ignora linhas desalinhadas em vez de travar o código
    }

    # Lê cada arquivo CSV tratando codificação e estrutura
    for arquivo in arquivos_csv:
        caminho_completo = os.path.join(pasta_origem, arquivo)
        
        try:
            # Tenta ler em UTF-8 (separador automático e correção de linhas)
            df = pd.read_csv(caminho_completo, **opcoes_leitura)
        except (UnicodeDecodeError, Exception):
            # Se falhar por codificação, força a leitura em Latin1
            df = pd.read_csv(caminho_completo, encoding="latin1", **opcoes_leitura)
            
        lista_dataframes.append(df)

    print("Combinando os dados...")
    # Junta todos mantendo as colunas mesmo que variem entre os arquivos
    df_final = pd.concat(lista_dataframes, ignore_index=True, sort=False)

    # Salva o resultado final pronto para o Excel brasileiro (com ';' e UTF-8-SIG)
    df_final.to_csv(arquivo_saida, index=False, sep=";", encoding="utf-8-sig")
    print(f"\nSucesso! Arquivo unificado salvo em:\n{arquivo_saida}")
