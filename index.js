const mongoose = require('mongoose')
const {HfInference} = require('@huggingface/inference')

const client = new HfInference("access-token")

async function get_story(target){
    const response = await fetch(`https://datasets-server.huggingface.co/rows?dataset=roneneldan%2FTinyStories&config=default&split=train&offset=${target}&length=50`)
    const data = await response.json()
    return data.rows
}

async function get_embeddings(texts){
    const response = await client.featureExtraction({
        model: "sentence-transformers/all-MiniLM-L6-v2",
        inputs: texts
    })
    return response;
}

async function push_to_mongo(){
    await mongoose.connect('mongo-string-----')
    const schema = new mongoose.Schema({
        story:String,
        embedding:[Number]
    })
    const Story = mongoose.model('Stories', schema)
    let story_data = await get_story(50)
    let arr = []
    for(let i = 0; i < 50; i++){
        const spit_arr_story = story_data[i].row.text.split(".");
        arr.push(spit_arr_story[0])
    }
    const embeddings = await get_embeddings(arr)

    for(let i = 0; i < 50; i++){
        const story = new Story({
            embedding:embeddings[i],
            story:story_data[i].row.text
        })
        await story.save()
        .then(()=>{console.log("Embeddings saved successfully")})
        .catch((err)=>{console.log("Error", err)})
    }
}

push_to_mongo()